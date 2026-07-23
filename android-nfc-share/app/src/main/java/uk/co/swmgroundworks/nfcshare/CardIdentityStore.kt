package uk.co.swmgroundworks.nfcshare

import android.content.Context
import android.content.SharedPreferences
import java.util.UUID
import kotlin.random.Random

/**
 * Stable cardId + nfcToken (SWMNFC_…) persisted like the web card localStorage.
 */
class CardIdentityStore(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    val cardId: String
        get() {
            var id = prefs.getString(KEY_CARD_ID, null)
            if (id.isNullOrBlank()) {
                id = "dbc_${System.currentTimeMillis()}_${UUID.randomUUID().toString().take(8)}"
                prefs.edit().putString(KEY_CARD_ID, id).apply()
            }
            return id
        }

    val nfcToken: String
        get() {
            var token = prefs.getString(KEY_TOKEN, null)
            if (token.isNullOrBlank()) {
                token = "SWMNFC_${cardId}_${randomSuffix()}"
                prefs.edit().putString(KEY_TOKEN, token).apply()
            }
            return token
        }

    var mode: SwmCard.Mode
        get() = SwmCard.Mode.fromKey(prefs.getString(KEY_MODE, SwmCard.Mode.TAP_N_SHARE.key))
        set(value) {
            prefs.edit().putString(KEY_MODE, value.key).apply()
        }

    fun cardUrl(): String = SwmCard.liveUrl(cardId, nfcToken, mode)

    private fun randomSuffix(): String {
        val alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
        return (1..12).map { alphabet[Random.nextInt(alphabet.length)] }.joinToString("")
    }

    companion object {
        private const val PREFS = "swm_nfc_share"
        private const val KEY_CARD_ID = "card_id"
        private const val KEY_TOKEN = "nfc_token"
        private const val KEY_MODE = "sharing_mode"
    }
}
