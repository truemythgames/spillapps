package app.bibletea

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.widget.RemoteViews
import java.io.File
import java.util.Calendar
import java.util.concurrent.Executors

class VerseWidgetProvider : AppWidgetProvider() {

    companion object {
        const val PREFS_NAME = "verse_widget_prefs"
        const val KEY_VERSE_TEXT = "verse_text"
        const val KEY_VERSE_REF = "verse_ref"
        const val KEY_STORY_ID = "story_id"
        const val KEY_COVER_PATH = "cover_image_path"

        private val DEFAULT_VERSES = listOf(
            Pair("Trust in the Lord with all your heart.", "Proverbs 3:5"),
            Pair("The Lord is my shepherd; I shall not want.", "Psalm 23:1"),
            Pair("Be strong and courageous. Do not be afraid.", "Joshua 1:9"),
            Pair("For I know the plans I have for you, declares the Lord.", "Jeremiah 29:11"),
            Pair("I can do all things through Christ who strengthens me.", "Philippians 4:13"),
        )

        fun getDefaultVerse(): Pair<String, String> {
            val day = Calendar.getInstance().get(Calendar.DAY_OF_YEAR)
            return DEFAULT_VERSES[day % DEFAULT_VERSES.size]
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (widgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId)
        }
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        widgetId: Int
    ) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val verseText = prefs.getString(KEY_VERSE_TEXT, null)
        val verseRef = prefs.getString(KEY_VERSE_REF, null)
        val storyId = prefs.getString(KEY_STORY_ID, null)
        val coverPath = prefs.getString(KEY_COVER_PATH, null)

        val (text, ref) = if (verseText != null && verseRef != null) {
            Pair(verseText, verseRef)
        } else {
            getDefaultVerse()
        }

        val options = appWidgetManager.getAppWidgetOptions(widgetId)
        val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0)
        val isMedium = minWidth >= 200

        val layoutId = if (isMedium) {
            context.resources.getIdentifier("widget_verse_medium", "layout", context.packageName)
        } else {
            context.resources.getIdentifier("widget_verse_small", "layout", context.packageName)
        }

        val views = RemoteViews(context.packageName, layoutId)

        val verseTextId = context.resources.getIdentifier("verse_text", "id", context.packageName)
        val verseRefId = context.resources.getIdentifier("verse_ref", "id", context.packageName)
        views.setTextViewText(verseTextId, text)
        views.setTextViewText(verseRefId, ref)

        if (isMedium) {
            val coverImageId = context.resources.getIdentifier("cover_image", "id", context.packageName)
            val coverBitmap = loadCoverBitmap(coverPath)
            if (coverBitmap != null) {
                views.setImageViewBitmap(coverImageId, coverBitmap)
            }
        }

        val deepLink = if (!storyId.isNullOrEmpty()) {
            Uri.parse("bibletea://story/$storyId")
        } else {
            Uri.parse("bibletea://")
        }
        val intent = Intent(Intent.ACTION_VIEW, deepLink).apply {
            setPackage(context.packageName)
        }
        val pendingIntent = PendingIntent.getActivity(
            context, widgetId, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(android.R.id.background, pendingIntent)

        appWidgetManager.updateAppWidget(widgetId, views)
    }

    private fun loadCoverBitmap(path: String?): Bitmap? {
        if (path.isNullOrEmpty()) return null
        return try {
            val file = File(path)
            if (file.exists()) {
                val opts = BitmapFactory.Options().apply {
                    inSampleSize = 2
                }
                BitmapFactory.decodeFile(path, opts)
            } else null
        } catch (_: Exception) {
            null
        }
    }

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: android.os.Bundle
    ) {
        updateWidget(context, appWidgetManager, appWidgetId)
    }
}
