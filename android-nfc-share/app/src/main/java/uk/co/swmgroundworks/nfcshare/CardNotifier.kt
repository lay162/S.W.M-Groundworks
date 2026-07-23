package uk.co.swmgroundworks.nfcshare

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

/**
 * Shows a heads-up notification when another Android taps us the SWM card.
 */
object CardNotifier {
    private const val CHANNEL_ID = "swm_card_received"
    private const val NOTIF_ID = 2201

    fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val mgr = context.getSystemService(NotificationManager::class.java) ?: return
        val channel = NotificationChannel(
            CHANNEL_ID,
            context.getString(R.string.channel_name),
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = context.getString(R.string.channel_desc)
            enableVibration(true)
        }
        mgr.createNotificationChannel(channel)
    }

    fun showCardReceived(context: Context, url: String, modeLabel: String) {
        ensureChannel(context)
        val open = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pi = PendingIntent.getActivity(
            context,
            0,
            open,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notif = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_nfc)
            .setContentTitle("S.W.M Groundworks — Business Card")
            .setContentText("$modeLabel · Tap to open the card")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("Another Android shared the S.W.M business card via NFC tap.\n$url")
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setAutoCancel(true)
            .setContentIntent(pi)
            .build()

        try {
            NotificationManagerCompat.from(context).notify(NOTIF_ID, notif)
        } catch (_: SecurityException) {
            // Notification permission denied — still open the card below if caller does.
        }
    }

    fun showContactSaved(context: Context) {
        ensureChannel(context)
        val notif = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_nfc)
            .setContentTitle("S.W.M contact ready")
            .setContentText("Tap n Save — open the notification to view the card / save contact")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(
                PendingIntent.getActivity(
                    context,
                    1,
                    Intent(Intent.ACTION_VIEW, Uri.parse(SwmCard.BASE_URL)),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
            )
            .build()
        try {
            NotificationManagerCompat.from(context).notify(NOTIF_ID + 1, notif)
        } catch (_: SecurityException) {
        }
    }
}
