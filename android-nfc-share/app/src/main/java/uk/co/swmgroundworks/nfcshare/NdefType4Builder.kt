package uk.co.swmgroundworks.nfcshare

import android.nfc.NdefMessage
import android.nfc.NdefRecord
import java.nio.charset.Charset

/**
 * Builds NFC Forum Type 4 Tag binary files (CC + NDEF) for HCE phone emulation.
 * No physical sticker — this phone IS the contactless card.
 */
object NdefType4Builder {

    /** NDEF application AID (NFC Forum Type 4). */
    val NDEF_AID: ByteArray = hex("D2760000850101")

    fun buildUriMessage(url: String, mode: SwmCard.Mode, token: String): NdefMessage {
        val uri = NdefRecord.createUri(url)
        val modeRec = NdefRecord.createTextRecord("en", "SWM_DBC_SHARE:${mode.key}")
        val tokenRec = NdefRecord.createTextRecord("en", token)
        val compact = NdefRecord.createTextRecord("en", "SWM|token|$token")
        return NdefMessage(arrayOf(uri, tokenRec, compact, modeRec))
    }

    fun buildSaveMessage(url: String, mode: SwmCard.Mode, token: String): NdefMessage {
        val uri = NdefRecord.createUri(url)
        val vcardBytes = SwmCard.vcard().toByteArray(Charset.forName("UTF-8"))
        val vcard = NdefRecord.createMime("text/vcard", vcardBytes)
        val modeRec = NdefRecord.createTextRecord("en", "SWM_DBC_SHARE:${mode.key}")
        val tokenRec = NdefRecord.createTextRecord("en", token)
        return NdefMessage(arrayOf(uri, vcard, tokenRec, modeRec))
    }

    fun ndefFileFor(message: NdefMessage): ByteArray {
        val payload = message.toByteArray()
        val nlen = payload.size
        require(nlen <= 0xFFFF) { "NDEF too large" }
        val out = ByteArray(2 + nlen)
        out[0] = ((nlen shr 8) and 0xFF).toByte()
        out[1] = (nlen and 0xFF).toByte()
        System.arraycopy(payload, 0, out, 2, nlen)
        return out
    }

    /** Capability Container (CC) — Type 4 Tag 2.0 style. */
    fun capabilityContainer(ndefFileLength: Int): ByteArray {
        // CCLEN (2) + Mapping version (1) + MLe (2) + MLc (2) + NDEF File Control TLV
        val fileSize = (ndefFileLength + 2).coerceAtMost(0xFFFE) // include NLEN field budget
        return byteArrayOf(
            0x00, 0x0F, // CCLEN = 15
            0x20, // Mapping version 2.0
            0x00, 0x3B, // MLe
            0x00, 0x34, // MLc
            0x04, // NDEF File Control TLV type
            0x06, // length
            0xE1.toByte(), 0x04.toByte(), // File ID E104
            ((fileSize shr 8) and 0xFF).toByte(),
            (fileSize and 0xFF).toByte(),
            0x00, // read access granted
            0x00  // write access granted (not used for HCE share)
        )
    }

    fun hex(s: String): ByteArray {
        val clean = s.replace(" ", "")
        return ByteArray(clean.length / 2) { i ->
            clean.substring(i * 2, i * 2 + 2).toInt(16).toByte()
        }
    }

    fun slice(src: ByteArray, offset: Int, length: Int): ByteArray {
        if (offset >= src.size) return ByteArray(0)
        val end = (offset + length).coerceAtMost(src.size)
        return src.copyOfRange(offset, end)
    }
}
