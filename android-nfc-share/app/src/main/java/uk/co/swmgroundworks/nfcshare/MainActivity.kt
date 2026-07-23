package uk.co.swmgroundworks.nfcshare

import android.Manifest
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.cardemulation.CardEmulation
import android.nfc.tech.Ndef
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.provider.Settings
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import uk.co.swmgroundworks.nfcshare.databinding.ActivityMainBinding
import java.nio.charset.Charset

/**
 * Bulletproof Android↔Android tap flow (no stickers):
 *
 * SHARE role: this phone emulates the SWM card via HCE (contactless).
 * RECEIVE role: this phone listens in reader mode → notification + open card.
 *
 * Install on both Androids for reliable tap → notification.
 */
class MainActivity : AppCompatActivity(), NfcAdapter.ReaderCallback {

    private enum class Role { SHARE, RECEIVE }

    private lateinit var binding: ActivityMainBinding
    private lateinit var store: CardIdentityStore
    private var nfcAdapter: NfcAdapter? = null
    private var cardEmulation: CardEmulation? = null
    private var role: Role = Role.SHARE

    private val notifPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        store = CardIdentityStore(this)
        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        cardEmulation = nfcAdapter?.let { CardEmulation.getInstance(it) }

        CardNotifier.ensureChannel(this)
        requestNotifPermissionIfNeeded()
        bindUi()
        handleIncomingIntent(intent)
        applyRole(Role.SHARE)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingIntent(intent)
    }

    override fun onResume() {
        super.onResume()
        applyNfcForCurrentRole()
        refreshStatus()
    }

    override fun onPause() {
        nfcAdapter?.disableReaderMode(this)
        preferHceService(false)
        super.onPause()
    }

    override fun onTagDiscovered(tag: Tag?) {
        if (tag == null || role != Role.RECEIVE) return
        val ndef = Ndef.get(tag) ?: return
        try {
            ndef.connect()
            val msg = ndef.ndefMessage ?: return
            runOnUiThread { handleNdefMessage(msg) }
        } catch (_: Exception) {
        } finally {
            try {
                ndef.close()
            } catch (_: Exception) {
            }
        }
    }

    private fun bindUi() {
        binding.modeShare.setOnClickListener { setMode(SwmCard.Mode.TAP_N_SHARE) }
        binding.modeSave.setOnClickListener { setMode(SwmCard.Mode.TAP_N_SAVE) }
        binding.modeSwap.setOnClickListener { setMode(SwmCard.Mode.TAP_N_SWAP) }

        binding.btnRoleShare.setOnClickListener { applyRole(Role.SHARE) }
        binding.btnRoleReceive.setOnClickListener { applyRole(Role.RECEIVE) }

        binding.btnOpenCard.setOnClickListener {
            startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(store.cardUrl())))
        }
        binding.btnNfcSettings.setOnClickListener {
            startActivity(Intent(Settings.ACTION_NFC_SETTINGS))
        }

        updateModeButtons()
        binding.txtToken.text = store.nfcToken
        binding.txtUrl.text = store.cardUrl()
    }

    private fun setMode(mode: SwmCard.Mode) {
        store.mode = mode
        updateModeButtons()
        binding.txtUrl.text = store.cardUrl()
        refreshStatus()
        Toast.makeText(this, "${mode.label} ready", Toast.LENGTH_SHORT).show()
    }

    private fun updateModeButtons() {
        val mode = store.mode
        binding.modeShare.isChecked = mode == SwmCard.Mode.TAP_N_SHARE
        binding.modeSave.isChecked = mode == SwmCard.Mode.TAP_N_SAVE
        binding.modeSwap.isChecked = mode == SwmCard.Mode.TAP_N_SWAP
        binding.txtModeActive.text = "${mode.label} active"
    }

    private fun applyRole(newRole: Role) {
        role = newRole
        applyNfcForCurrentRole()
        refreshStatus()
    }

    /**
     * Critical: do not run Reader + HCE at once on the same phone.
     * SHARE = HCE only. RECEIVE = Reader only.
     */
    private fun applyNfcForCurrentRole() {
        val adapter = nfcAdapter ?: return
        adapter.disableReaderMode(this)
        preferHceService(false)

        if (!adapter.isEnabled) return

        when (role) {
            Role.SHARE -> preferHceService(true)
            Role.RECEIVE -> {
                val extras = Bundle().apply {
                    putInt(NfcAdapter.EXTRA_READER_PRESENCE_CHECK_DELAY, 250)
                }
                val flags =
                    NfcAdapter.FLAG_READER_NFC_A or
                        NfcAdapter.FLAG_READER_NFC_B or
                        NfcAdapter.FLAG_READER_NO_PLATFORM_SOUNDS
                adapter.enableReaderMode(this, this, flags, extras)
            }
        }
    }

    private fun refreshStatus() {
        val adapter = nfcAdapter
        when {
            adapter == null -> {
                binding.txtStatus.text = "This phone has no NFC hardware."
                binding.txtHint.text = "Use an Android device with NFC."
            }
            !adapter.isEnabled -> {
                binding.txtStatus.text = "NFC is OFF — turn it on."
                binding.txtHint.text = "Open NFC settings, enable NFC, then return here."
            }
            role == Role.SHARE -> {
                binding.txtStatus.text =
                    "Sharing ${store.mode.label} — keep this screen open. Other phone taps your back."
                binding.txtHint.text =
                    "Phone A (you): Share my card.\n" +
                        "Phone B: open this app → Receive a card → hold backs together.\n" +
                        "B gets a notification and the S.W.M card opens.\n" +
                        "For Tap n Swap: B receives, then switches to Share so A can Receive."
            }
            else -> {
                binding.txtStatus.text =
                    "Listening for ${store.mode.label} — hold against the sharing phone."
                binding.txtHint.text =
                    "Keep this screen open. When the other Android is on Share,\n" +
                        "tap phone backs together. You’ll get a notification."
            }
        }
    }

    private fun preferHceService(enable: Boolean) {
        val ce = cardEmulation ?: return
        val component = ComponentName(this, NdefHceService::class.java)
        try {
            if (enable) ce.setPreferredService(this, component)
            else ce.unsetPreferredService(this)
        } catch (_: Exception) {
        }
    }

    private fun handleIncomingIntent(intent: Intent?) {
        if (intent == null) return
        if (NfcAdapter.ACTION_NDEF_DISCOVERED == intent.action ||
            NfcAdapter.ACTION_TECH_DISCOVERED == intent.action ||
            NfcAdapter.ACTION_TAG_DISCOVERED == intent.action
        ) {
            @Suppress("DEPRECATION")
            val raw = intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES) ?: return
            for (p in raw) {
                val msg = p as? NdefMessage ?: continue
                handleNdefMessage(msg)
            }
        }
    }

    private fun handleNdefMessage(message: NdefMessage) {
        var url: String? = null
        var mode = store.mode
        var hasVcard = false

        for (record in message.records) {
            when {
                record.tnf == NdefRecord.TNF_WELL_KNOWN &&
                    record.type.contentEquals(NdefRecord.RTD_URI) -> {
                    url = parseUriRecord(record) ?: url
                }
                record.tnf == NdefRecord.TNF_WELL_KNOWN &&
                    record.type.contentEquals(NdefRecord.RTD_TEXT) -> {
                    val text = parseTextRecord(record)
                    if (text.startsWith("SWM_DBC_SHARE:")) {
                        mode = SwmCard.Mode.fromKey(text.removePrefix("SWM_DBC_SHARE:").trim())
                    }
                }
                record.tnf == NdefRecord.TNF_MIME_MEDIA -> {
                    val mime = String(record.type, Charset.forName("US-ASCII"))
                    if (mime.contains("vcard", ignoreCase = true)) hasVcard = true
                }
            }
        }

        if (url.isNullOrBlank() && !hasVcard) return

        vibrate()
        val openUrl = url ?: SwmCard.BASE_URL

        when (mode) {
            SwmCard.Mode.TAP_N_SAVE -> {
                CardNotifier.showContactSaved(this)
                startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(openUrl)))
            }
            SwmCard.Mode.TAP_N_SHARE -> {
                CardNotifier.showCardReceived(this, openUrl, mode.label)
                startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(openUrl)))
            }
            SwmCard.Mode.TAP_N_SWAP -> {
                CardNotifier.showCardReceived(this, openUrl, mode.label)
                startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(openUrl)))
                // Auto flip to Share so the other person can receive yours back
                Toast.makeText(this, "Received — now Sharing yours back. Keep phones together.", Toast.LENGTH_LONG).show()
                applyRole(Role.SHARE)
                return
            }
        }

        Toast.makeText(this, "${mode.label}: card received", Toast.LENGTH_SHORT).show()
    }

    private fun parseUriRecord(record: NdefRecord): String? =
        try {
            record.toUri()?.toString()
        } catch (_: Exception) {
            null
        }

    private fun parseTextRecord(record: NdefRecord): String {
        val payload = record.payload
        if (payload.isEmpty()) return ""
        val langLen = payload[0].toInt() and 0x3F
        val start = 1 + langLen
        if (start >= payload.size) return ""
        return String(payload, start, payload.size - start, Charset.forName("UTF-8"))
    }

    private fun vibrate() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                getSystemService(VibratorManager::class.java)
                    ?.defaultVibrator
                    ?.vibrate(VibrationEffect.createOneShot(60, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                val v = getSystemService(VIBRATOR_SERVICE) as Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createOneShot(60, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    v.vibrate(60)
                }
            }
        } catch (_: Exception) {
        }
    }

    private fun requestNotifPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
            != PackageManager.PERMISSION_GRANTED
        ) {
            notifPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }
}
