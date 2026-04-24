package app.historytea

import android.content.Intent
import android.os.Build
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class NowPlayingBridgeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val NAME = "NowPlayingBridge"
    private var instance: NowPlayingBridgeModule? = null

    fun emitEvent(name: String, body: WritableMap? = null) {
      val inst = instance ?: return
      inst.reactApplicationContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(name, body)
    }
  }

  init {
    instance = this
  }

  override fun getName(): String = NAME

  override fun invalidate() {
    super.invalidate()
    if (instance === this) instance = null
  }

  override fun getConstants(): MutableMap<String, Any> = mutableMapOf()

  @ReactMethod
  fun addListener(eventName: String) {
    // Required for RN built-in Event Emitter calls
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // Required for RN built-in Event Emitter calls
  }

  @ReactMethod
  fun ping(promise: Promise) {
    promise.resolve("pong")
  }

  @ReactMethod
  fun updateNowPlaying(info: ReadableMap) {
    val ctx = reactApplicationContext
    val intent = Intent(ctx, PlaybackService::class.java).apply {
      action = PlaybackService.ACTION_UPDATE
      if (info.hasKey("title")) putExtra("title", info.getString("title"))
      if (info.hasKey("artist")) putExtra("artist", info.getString("artist"))
      if (info.hasKey("duration")) putExtra("duration", info.getDouble("duration"))
      if (info.hasKey("position")) putExtra("position", info.getDouble("position"))
      if (info.hasKey("rate")) putExtra("rate", info.getDouble("rate"))
      if (info.hasKey("artworkUrl")) putExtra("artworkUrl", info.getString("artworkUrl"))
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      ContextCompat.startForegroundService(ctx, intent)
    } else {
      ctx.startService(intent)
    }
  }

  @ReactMethod
  fun clearNowPlaying() {
    val ctx = reactApplicationContext
    val intent = Intent(ctx, PlaybackService::class.java).apply {
      action = PlaybackService.ACTION_STOP
    }
    ctx.startService(intent)
  }
}
