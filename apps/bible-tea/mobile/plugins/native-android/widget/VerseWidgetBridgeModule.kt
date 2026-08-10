package app.bibletea

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream
import java.net.URL
import java.util.concurrent.Executors

class VerseWidgetBridgeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "VerseWidgetBridge"
        const val MAX_RETRIES = 3
    }

    private val executor = Executors.newSingleThreadExecutor()

    override fun getName(): String = NAME

    @ReactMethod
    fun updateWidget(
        verseText: String,
        verseRef: String,
        storyId: String,
        coverUrl: String,
        coverBase64: String,
        promise: Promise
    ) {
        val ctx = reactApplicationContext

        val prefs = ctx.getSharedPreferences(
            VerseWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE
        )
        prefs.edit()
            .putString(VerseWidgetProvider.KEY_VERSE_TEXT, verseText)
            .putString(VerseWidgetProvider.KEY_VERSE_REF, verseRef)
            .putString(VerseWidgetProvider.KEY_STORY_ID, storyId)
            .apply()

        executor.execute {
            if (coverBase64.isNotEmpty()) {
                try {
                    val bytes = android.util.Base64.decode(coverBase64, android.util.Base64.DEFAULT)
                    if (bytes.isNotEmpty()) {
                        val file = File(ctx.filesDir, "widget_cover.img")
                        FileOutputStream(file).use { it.write(bytes) }
                        prefs.edit()
                            .putString(VerseWidgetProvider.KEY_COVER_PATH, file.absolutePath)
                            .putString(VerseWidgetProvider.KEY_COVER_URL, coverUrl)
                            .apply()
                    }
                } catch (_: Exception) {
                    if (coverUrl.isNotEmpty()) downloadCover(ctx, coverUrl, 1)
                }
            } else if (coverUrl.isNotEmpty()) {
                downloadCover(ctx, coverUrl, 1)
            }
            notifyWidgets(ctx)
            promise.resolve(true)
        }
    }

    private fun downloadCover(ctx: Context, coverUrl: String, attempt: Int) {
        try {
            val connection = URL(coverUrl).openConnection().apply {
                connectTimeout = 15000
                readTimeout = 15000
            }
            val bytes = connection.getInputStream().readBytes()
            if (bytes.isNotEmpty()) {
                val file = File(ctx.filesDir, "widget_cover.img")
                FileOutputStream(file).use { it.write(bytes) }
                val prefs = ctx.getSharedPreferences(
                    VerseWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE
                )
                prefs.edit()
                    .putString(VerseWidgetProvider.KEY_COVER_PATH, file.absolutePath)
                    .putString(VerseWidgetProvider.KEY_COVER_URL, coverUrl)
                    .apply()
            }
        } catch (_: Exception) {
            if (attempt < MAX_RETRIES) {
                Thread.sleep(attempt * 1000L)
                downloadCover(ctx, coverUrl, attempt + 1)
            }
        }
    }

    @ReactMethod
    fun refreshTimeline(promise: Promise) {
        notifyWidgets(reactApplicationContext)
        promise.resolve(true)
    }

    @ReactMethod
    fun isWidgetInstalled(promise: Promise) {
        val ctx = reactApplicationContext
        val manager = AppWidgetManager.getInstance(ctx)
        val component = ComponentName(ctx, VerseWidgetProvider::class.java)
        val ids = manager.getAppWidgetIds(component)
        promise.resolve(ids.isNotEmpty())
    }

    private fun notifyWidgets(ctx: Context) {
        val manager = AppWidgetManager.getInstance(ctx)
        val component = ComponentName(ctx, VerseWidgetProvider::class.java)
        val ids = manager.getAppWidgetIds(component)
        if (ids.isEmpty()) return

        // Must go through a real broadcast: the provider calls goAsync() to
        // refresh, which is only valid while a broadcast is being delivered.
        val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
        intent.component = component
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        ctx.sendBroadcast(intent)
    }
}
