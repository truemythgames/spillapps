package app.bibletea

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
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
    }

    private val executor = Executors.newSingleThreadExecutor()

    override fun getName(): String = NAME

    @ReactMethod
    fun updateWidget(
        verseText: String,
        verseRef: String,
        storyId: String,
        coverUrl: String,
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

        if (coverUrl.isNotEmpty()) {
            executor.execute {
                try {
                    val bytes = URL(coverUrl).readBytes()
                    val file = File(ctx.filesDir, "widget_cover.jpg")
                    FileOutputStream(file).use { it.write(bytes) }
                    prefs.edit()
                        .putString(VerseWidgetProvider.KEY_COVER_PATH, file.absolutePath)
                        .apply()
                } catch (_: Exception) {}

                notifyWidgets(ctx)
                promise.resolve(true)
            }
        } else {
            notifyWidgets(ctx)
            promise.resolve(true)
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
        if (ids.isNotEmpty()) {
            val provider = VerseWidgetProvider()
            provider.onUpdate(ctx, manager, ids)
        }
    }
}
