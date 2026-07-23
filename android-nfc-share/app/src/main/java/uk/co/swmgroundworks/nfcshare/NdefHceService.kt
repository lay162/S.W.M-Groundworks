package uk.co.swmgroundworks.nfcshare

import android.content.Context
import android.nfc.NdefMessage
import android.nfc.cardemulation.HostApduService
import android.os.Bundle
import uk.co.swmgroundworks.nfcshare.NdefType4Builder.hex

/**
 * Host Card Emulation — this Android phone becomes the contactless SWM card.
 * Other Android devices / readers that tap receive URL + token (+ vCard in save mode).
 */
class NdefHceService : HostApduService() {

    private var selectedFile: FileId = FileId.NONE
    private var ndefFile: ByteArray = ByteArray(0)
    private var ccFile: ByteArray = ByteArray(0)

    override fun onCreate() {
        super.onCreate()
        refreshPayload(applicationContext)
    }

    override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray {
        if (commandApdu == null || commandApdu.size < 4) return SW_UNKNOWN

        // Keep payload in sync with current mode / token
        refreshPayload(applicationContext)

        val ins = commandApdu[1].toInt() and 0xFF

        return when (ins) {
            INS_SELECT -> handleSelect(commandApdu)
            INS_READ_BINARY -> handleReadBinary(commandApdu)
            else -> SW_UNKNOWN
        }
    }

    override fun onDeactivated(reason: Int) {
        selectedFile = FileId.NONE
    }

    private fun handleSelect(apdu: ByteArray): ByteArray {
        val lc = if (apdu.size > 4) apdu[4].toInt() and 0xFF else 0
        if (apdu.size < 5 + lc) return SW_FILE_NOT_FOUND
        val data = apdu.copyOfRange(5, 5 + lc)

        // SELECT by name (AID)
        if ((apdu[2].toInt() and 0xFF) == 0x04 && (apdu[3].toInt() and 0xFF) == 0x00) {
            return if (data.contentEquals(NdefType4Builder.NDEF_AID)) {
                selectedFile = FileId.NONE
                SW_OK
            } else {
                SW_FILE_NOT_FOUND
            }
        }

        // SELECT by file ID
        if (lc == 2) {
            val fid = ((data[0].toInt() and 0xFF) shl 8) or (data[1].toInt() and 0xFF)
            selectedFile = when (fid) {
                FID_CC -> FileId.CC
                FID_NDEF -> FileId.NDEF
                else -> FileId.NONE
            }
            return if (selectedFile != FileId.NONE) SW_OK else SW_FILE_NOT_FOUND
        }

        return SW_FILE_NOT_FOUND
    }

    private fun handleReadBinary(apdu: ByteArray): ByteArray {
        val p1 = apdu[2].toInt() and 0xFF
        val p2 = apdu[3].toInt() and 0xFF
        val offset = (p1 shl 8) or p2
        val le = if (apdu.size > 4) {
            val raw = apdu[4].toInt() and 0xFF
            if (raw == 0) 256 else raw
        } else 0

        val file = when (selectedFile) {
            FileId.CC -> ccFile
            FileId.NDEF -> ndefFile
            FileId.NONE -> return SW_CONDITIONS_NOT_SATISFIED
        }

        if (offset > file.size) return SW_WRONG_LENGTH
        val chunk = NdefType4Builder.slice(file, offset, le)
        return chunk + SW_OK
    }

    private fun refreshPayload(context: Context) {
        val store = CardIdentityStore(context)
        val mode = store.mode
        val url = store.cardUrl()
        val message: NdefMessage = when (mode) {
            SwmCard.Mode.TAP_N_SAVE -> NdefType4Builder.buildSaveMessage(url, mode, store.nfcToken)
            SwmCard.Mode.TAP_N_SHARE,
            SwmCard.Mode.TAP_N_SWAP -> NdefType4Builder.buildUriMessage(url, mode, store.nfcToken)
        }
        ndefFile = NdefType4Builder.ndefFileFor(message)
        ccFile = NdefType4Builder.capabilityContainer(ndefFile.size)
    }

    private enum class FileId { NONE, CC, NDEF }

    companion object {
        private const val INS_SELECT = 0xA4
        private const val INS_READ_BINARY = 0xB0
        private const val FID_CC = 0xE103
        private const val FID_NDEF = 0xE104

        private val SW_OK = hex("9000")
        private val SW_FILE_NOT_FOUND = hex("6A82")
        private val SW_WRONG_LENGTH = hex("6700")
        private val SW_CONDITIONS_NOT_SATISFIED = hex("6985")
        private val SW_UNKNOWN = hex("6F00")

        /** SharedPreferences key used so Activity can force-refresh before share. */
        const val ACTION_REFRESH = "uk.co.swmgroundworks.nfcshare.REFRESH_HCE"
    }
}
