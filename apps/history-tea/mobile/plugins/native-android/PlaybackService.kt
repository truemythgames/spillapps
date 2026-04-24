package app.historytea

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.os.IBinder
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import androidx.core.app.NotificationCompat
import androidx.media.app.NotificationCompat.MediaStyle
import androidx.media.session.MediaButtonReceiver
import com.facebook.react.bridge.Arguments
import java.net.URL
import kotlin.concurrent.thread

class PlaybackService : Service() {

  companion object {
    const val ACTION_UPDATE = "app.historytea.playback.UPDATE"
    const val ACTION_STOP = "app.historytea.playback.STOP"
    const val CHANNEL_ID = "historytea_playback"
    const val NOTIFICATION_ID = 1138
  }

  private lateinit var mediaSession: MediaSessionCompat
  private var currentArtworkUrl: String? = null
  private var currentArtwork: Bitmap? = null
  private var currentTitle: String = "History Tea"
  private var currentArtist: String = "History Tea"
  private var currentDurationSec: Double = 0.0
  private var currentPositionSec: Double = 0.0
  private var currentRate: Double = 1.0
  private var isPlaying: Boolean = false

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    createChannel()
    mediaSession = MediaSessionCompat(this, "HistoryTeaSession").apply {
      setFlags(
        MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS or
          MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS
      )
      setCallback(object : MediaSessionCompat.Callback() {
        override fun onPlay() {
          NowPlayingBridgeModule.emitEvent("onRemotePlay")
        }
        override fun onPause() {
          NowPlayingBridgeModule.emitEvent("onRemotePause")
        }
        override fun onSkipToNext() {
          NowPlayingBridgeModule.emitEvent("onRemoteSkipForward")
        }
        override fun onSkipToPrevious() {
          NowPlayingBridgeModule.emitEvent("onRemoteSkipBackward")
        }
        override fun onFastForward() {
          NowPlayingBridgeModule.emitEvent("onRemoteSkipForward")
        }
        override fun onRewind() {
          NowPlayingBridgeModule.emitEvent("onRemoteSkipBackward")
        }
        override fun onSeekTo(pos: Long) {
          val body = Arguments.createMap().apply {
            putDouble("position", pos / 1000.0)
          }
          NowPlayingBridgeModule.emitEvent("onRemoteSeek", body)
        }
      })
      isActive = true
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_STOP -> {
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        return START_NOT_STICKY
      }
      ACTION_UPDATE, null -> {
        intent?.let { applyUpdate(it) }
      }
    }
    startForegroundWithNotification()
    return START_STICKY
  }

  private fun applyUpdate(intent: Intent) {
    intent.getStringExtra("title")?.let { currentTitle = it }
    intent.getStringExtra("artist")?.let { currentArtist = it }
    if (intent.hasExtra("duration")) currentDurationSec = intent.getDoubleExtra("duration", currentDurationSec)
    if (intent.hasExtra("position")) currentPositionSec = intent.getDoubleExtra("position", currentPositionSec)
    if (intent.hasExtra("rate")) currentRate = intent.getDoubleExtra("rate", currentRate)
    isPlaying = currentRate > 0.0

    val newArtUrl = intent.getStringExtra("artworkUrl")
    if (newArtUrl != null && newArtUrl != currentArtworkUrl) {
      currentArtworkUrl = newArtUrl
      loadArtworkAsync(newArtUrl)
    }

    updateMediaSessionMetadata()
    updateMediaSessionState()
  }

  private fun updateMediaSessionMetadata() {
    val meta = MediaMetadataCompat.Builder()
      .putString(MediaMetadataCompat.METADATA_KEY_TITLE, currentTitle)
      .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, currentArtist)
      .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, (currentDurationSec * 1000L).toLong())
      .apply {
        currentArtwork?.let {
          putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, it)
          putBitmap(MediaMetadataCompat.METADATA_KEY_ART, it)
        }
      }
      .build()
    mediaSession.setMetadata(meta)
  }

  private fun updateMediaSessionState() {
    val state = if (isPlaying) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED
    val actions = PlaybackStateCompat.ACTION_PLAY or
      PlaybackStateCompat.ACTION_PAUSE or
      PlaybackStateCompat.ACTION_PLAY_PAUSE or
      PlaybackStateCompat.ACTION_SEEK_TO or
      PlaybackStateCompat.ACTION_FAST_FORWARD or
      PlaybackStateCompat.ACTION_REWIND or
      PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
      PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS
    val pb = PlaybackStateCompat.Builder()
      .setActions(actions)
      .setState(state, (currentPositionSec * 1000L).toLong(), currentRate.toFloat().coerceAtLeast(0.1f))
      .build()
    mediaSession.setPlaybackState(pb)
  }

  private fun startForegroundWithNotification() {
    val notif = buildNotification()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(NOTIFICATION_ID, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
    } else {
      startForeground(NOTIFICATION_ID, notif)
    }
  }

  private fun buildNotification(): Notification {
    val style = MediaStyle()
      .setMediaSession(mediaSession.sessionToken)
      .setShowActionsInCompactView(0, 1, 2)

    val tapPI = PendingIntent.getActivity(
      this,
      0,
      packageManager.getLaunchIntentForPackage(packageName),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val builder = NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_media_play)
      .setContentTitle(currentTitle)
      .setContentText(currentArtist)
      .setLargeIcon(currentArtwork)
      .setContentIntent(tapPI)
      .setDeleteIntent(MediaButtonReceiver.buildMediaButtonPendingIntent(this, PlaybackStateCompat.ACTION_STOP))
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setStyle(style)
      .setOnlyAlertOnce(true)
      .setShowWhen(false)

    builder.addAction(
      NotificationCompat.Action(
        android.R.drawable.ic_media_rew,
        "Rewind",
        MediaButtonReceiver.buildMediaButtonPendingIntent(this, PlaybackStateCompat.ACTION_REWIND)
      )
    )

    if (isPlaying) {
      builder.addAction(
        NotificationCompat.Action(
          android.R.drawable.ic_media_pause,
          "Pause",
          MediaButtonReceiver.buildMediaButtonPendingIntent(this, PlaybackStateCompat.ACTION_PAUSE)
        )
      )
    } else {
      builder.addAction(
        NotificationCompat.Action(
          android.R.drawable.ic_media_play,
          "Play",
          MediaButtonReceiver.buildMediaButtonPendingIntent(this, PlaybackStateCompat.ACTION_PLAY)
        )
      )
    }

    builder.addAction(
      NotificationCompat.Action(
        android.R.drawable.ic_media_ff,
        "Fast Forward",
        MediaButtonReceiver.buildMediaButtonPendingIntent(this, PlaybackStateCompat.ACTION_FAST_FORWARD)
      )
    )

    return builder.build()
  }

  private fun loadArtworkAsync(url: String) {
    thread(start = true, isDaemon = true, name = "historytea-artwork") {
      try {
        val conn = URL(url).openConnection()
        conn.connectTimeout = 10_000
        conn.readTimeout = 10_000
        conn.getInputStream().use { stream ->
          val bmp = BitmapFactory.decodeStream(stream)
          if (bmp != null) {
            currentArtwork = bmp
            // Refresh metadata and notification on main thread
            android.os.Handler(mainLooper).post {
              updateMediaSessionMetadata()
              val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
              nm.notify(NOTIFICATION_ID, buildNotification())
            }
          }
        }
      } catch (_: Throwable) {
        // Ignore artwork failures
      }
    }
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val nm = getSystemService(NotificationManager::class.java)
      if (nm.getNotificationChannel(CHANNEL_ID) == null) {
        val channel = NotificationChannel(
          CHANNEL_ID,
          "Playback",
          NotificationManager.IMPORTANCE_LOW
        ).apply {
          description = "Audio playback controls"
          setShowBadge(false)
        }
        nm.createNotificationChannel(channel)
      }
    }
  }

  override fun onDestroy() {
    mediaSession.isActive = false
    mediaSession.release()
    super.onDestroy()
  }
}
