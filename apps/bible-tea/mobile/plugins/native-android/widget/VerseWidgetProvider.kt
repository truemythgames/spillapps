package app.bibletea

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.view.View
import android.widget.RemoteViews
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.Calendar
import java.util.concurrent.Executors

class VerseWidgetProvider : AppWidgetProvider() {

    companion object {
        const val PREFS_NAME = "verse_widget_prefs"
        const val KEY_VERSE_TEXT = "verse_text"
        const val KEY_VERSE_REF = "verse_ref"
        const val KEY_STORY_ID = "story_id"
        const val KEY_COVER_PATH = "cover_image_path"
        const val KEY_COVER_URL = "cover_image_url"

        private const val SOTD_URL =
            "https://api.spillapps.com/v1/featured/story-of-the-day"

        /**
         * RemoteViews bitmaps cross a Binder transaction capped near 1MB, so a
         * full 1024px cover (4MB as ARGB_8888) fails to render at all. At this
         * cap, RGB_565 keeps a cover around 0.5MB.
         */
        private const val MAX_COVER_PX = 512

        private val executor = Executors.newSingleThreadExecutor()

        private val DEFAULT_VERSES = listOf(
            Pair("Trust in the Lord with all your heart and lean not on your own understanding.", "Proverbs 3:5"),
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
        // Draw cached content first so the widget is never blank while we fetch.
        for (widgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId)
        }

        // goAsync throws if we weren't invoked from a real broadcast.
        val pending = try {
            goAsync()
        } catch (_: Exception) {
            null
        }

        executor.execute {
            try {
                if (fetchStoryOfTheDay(context)) {
                    for (widgetId in appWidgetIds) {
                        updateWidget(context, appWidgetManager, widgetId)
                    }
                }
            } catch (_: Exception) {
                // Keep whatever was already drawn from cache.
            } finally {
                pending?.finish()
            }
        }
    }

    /**
     * The widget owns its own refresh so it keeps working when the app hasn't
     * been opened. Returns whether anything changed.
     */
    private fun fetchStoryOfTheDay(context: Context): Boolean {
        val connection = (URL(SOTD_URL).openConnection() as HttpURLConnection).apply {
            connectTimeout = 15000
            readTimeout = 15000
            setRequestProperty("X-App-Id", "bible-tea")
            setRequestProperty("Accept", "application/json")
        }

        val body = try {
            if (connection.responseCode !in 200..299) return false
            connection.inputStream.bufferedReader().use { it.readText() }
        } finally {
            connection.disconnect()
        }

        val json = JSONObject(body)
        val story = json.optJSONObject("story") ?: return false
        val slug = story.optString("slug").ifEmpty { story.optString("id") }
        val coverUrl = story.optString("cover_image_url")

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        var changed = false

        if (slug.isNotEmpty() && prefs.getString(KEY_STORY_ID, null) != slug) {
            prefs.edit().putString(KEY_STORY_ID, slug).apply()
            changed = true
        }

        // Only re-download when the cover actually changed.
        val cachedPath = prefs.getString(KEY_COVER_PATH, null)
        val coverIsCached = prefs.getString(KEY_COVER_URL, null) == coverUrl &&
            cachedPath != null && File(cachedPath).exists()

        if (coverUrl.isNotEmpty() && !coverIsCached) {
            val bytes = URL(coverUrl).openStream().use { it.readBytes() }
            if (bytes.isNotEmpty()) {
                val file = File(context.filesDir, "widget_cover.img")
                FileOutputStream(file).use { it.write(bytes) }
                prefs.edit()
                    .putString(KEY_COVER_PATH, file.absolutePath)
                    .putString(KEY_COVER_URL, coverUrl)
                    .apply()
                changed = true
            }
        }

        return changed
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
        val minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0)

        val layoutName = when {
            minHeight >= 200 -> "widget_verse_large"
            minWidth >= 200 -> "widget_verse_medium"
            else -> "widget_verse_small"
        }

        val layoutId = context.resources.getIdentifier(layoutName, "layout", context.packageName)
        val views = RemoteViews(context.packageName, layoutId)

        val verseTextId = context.resources.getIdentifier("verse_text", "id", context.packageName)
        val verseRefId = context.resources.getIdentifier("verse_ref", "id", context.packageName)
        views.setTextViewText(verseTextId, text)
        views.setTextViewText(verseRefId, ref)

        val density = context.resources.displayMetrics.density
        val targetPx = targetCoverPx(minWidth, minHeight, density)
        val coverBitmap = loadCoverBitmap(coverPath, targetPx)

        val coverImageId = context.resources.getIdentifier("cover_image", "id", context.packageName)
        val coverScrimId = context.resources.getIdentifier("cover_scrim", "id", context.packageName)

        if (coverBitmap != null) {
            views.setImageViewBitmap(coverImageId, coverBitmap)
            views.setViewVisibility(coverImageId, View.VISIBLE)
        } else {
            views.setViewVisibility(coverImageId, View.GONE)
        }
        if (coverScrimId != 0) {
            views.setViewVisibility(
                coverScrimId,
                if (coverBitmap != null) View.VISIBLE else View.GONE
            )
        }

        // Three slashes keeps "story" in the path; with two it parses as the
        // host and expo-router matches no route.
        val deepLink = if (!storyId.isNullOrEmpty()) {
            Uri.parse("bibletea:///story/$storyId")
        } else {
            Uri.parse("bibletea:///")
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

    private fun targetCoverPx(minWidthDp: Int, minHeightDp: Int, density: Float): Int {
        val largestDp = maxOf(minWidthDp, minHeightDp).takeIf { it > 0 } ?: 180
        val requested = (largestDp * density).toInt()
        return requested.coerceIn(1, MAX_COVER_PX)
    }

    private fun loadCoverBitmap(path: String?, targetPx: Int): Bitmap? {
        if (path.isNullOrEmpty()) return null
        return try {
            val file = File(path)
            if (!file.exists()) return null

            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeFile(path, bounds)
            if (bounds.outWidth <= 0 || bounds.outHeight <= 0) return null

            val opts = BitmapFactory.Options().apply {
                inSampleSize = sampleSizeFor(bounds.outWidth, bounds.outHeight, targetPx)
                inPreferredConfig = Bitmap.Config.RGB_565
            }
            val decoded = BitmapFactory.decodeFile(path, opts) ?: return null

            // Sampling only halves, so trim any remainder above the cap.
            val largest = maxOf(decoded.width, decoded.height)
            if (largest <= targetPx) return decoded

            val scale = targetPx.toFloat() / largest
            val scaled = Bitmap.createScaledBitmap(
                decoded,
                (decoded.width * scale).toInt().coerceAtLeast(1),
                (decoded.height * scale).toInt().coerceAtLeast(1),
                true
            )
            if (scaled != decoded) decoded.recycle()
            scaled
        } catch (_: Exception) {
            null
        }
    }

    private fun sampleSizeFor(width: Int, height: Int, targetPx: Int): Int {
        var sampleSize = 1
        var halfWidth = width / 2
        var halfHeight = height / 2
        while (halfWidth / sampleSize >= targetPx && halfHeight / sampleSize >= targetPx) {
            sampleSize *= 2
        }
        return sampleSize
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
