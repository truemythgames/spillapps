import WidgetKit
import SwiftUI
import UIKit
import ImageIO

struct VerseEntry: TimelineEntry {
    let date: Date
    let verseText: String
    let verseRef: String
    let storyId: String?
    let coverImage: UIImage?
}

struct VerseProvider: TimelineProvider {
    private static let appGroupId = "group.app.bibletea"
    private static let verseKey = "widget_verse_data"
    private static let coverDataKey = "widget_cover_data"
    private static let coverUrlKey = "widget_cover_url"
    private static let sotdURL = URL(string: "https://api.spillapps.com/v1/featured/story-of-the-day")!

    func placeholder(in context: Context) -> VerseEntry {
        defaultEntry()
    }

    func getSnapshot(in context: Context, completion: @escaping (VerseEntry) -> Void) {
        // The gallery can't wait on the network; draw from cache immediately.
        if context.isPreview {
            let fallback = defaultEntry()
            let cached = readAppGroupVerse()
            completion(VerseEntry(
                date: Date(),
                verseText: cached?.text ?? fallback.verseText,
                verseRef: cached?.ref ?? fallback.verseRef,
                storyId: cached?.storyId,
                coverImage: Self.loadCachedCover(maxPixel: Self.maxPixel(for: context))
            ))
            return
        }
        buildEntry(maxPixel: Self.maxPixel(for: context)) { entry, _ in
            completion(entry)
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VerseEntry>) -> Void) {
        buildEntry(maxPixel: Self.maxPixel(for: context)) { entry, loaded in
            // Content changes once a day; retry sooner if the fetch failed.
            let next = loaded ? Self.nextDailyRefresh() : Date().addingTimeInterval(30 * 60)
            completion(Timeline(entries: [entry], policy: .after(next)))
        }
    }

    /// Largest pixel dimension this family can actually display, so a 1024px
    /// cover isn't decoded at full size inside the extension's memory budget.
    private static func maxPixel(for context: Context) -> Int {
        let side = max(context.displaySize.width, context.displaySize.height)
        return Int(side * 3)
    }

    private static func nextDailyRefresh() -> Date {
        let calendar = Calendar.current
        guard let tomorrow = calendar.date(byAdding: .day, value: 1, to: Date()) else {
            return Date().addingTimeInterval(24 * 60 * 60)
        }
        return calendar.startOfDay(for: tomorrow).addingTimeInterval(5 * 60)
    }

    private func defaultEntry() -> VerseEntry {
        VerseEntry(
            date: Date(),
            verseText: "Trust in the Lord with all your heart and lean not on your own understanding.",
            verseRef: "Proverbs 3:5",
            storyId: nil,
            coverImage: nil
        )
    }

    /// Network-first: widget loads story-of-the-day + cover itself.
    /// App Group is only used as an optional overlay for the daily verse text.
    /// The flag reports whether the story fetch succeeded, so the caller can
    /// decide how soon to try again.
    private func buildEntry(maxPixel: Int, completion: @escaping (VerseEntry, Bool) -> Void) {
        let cached = readAppGroupVerse()

        var request = URLRequest(url: Self.sotdURL)
        request.setValue("bible-tea", forHTTPHeaderField: "X-App-Id")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.timeoutInterval = 20
        request.cachePolicy = .reloadIgnoringLocalCacheData

        URLSession.shared.dataTask(with: request) { data, _, _ in
            guard let data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let story = json["story"] as? [String: Any] else {
                // API failed — still try cached cover from app group
                let cover = Self.loadCachedCover(maxPixel: maxPixel)
                completion(VerseEntry(
                    date: Date(),
                    verseText: cached?.text ?? self.defaultEntry().verseText,
                    verseRef: cached?.ref ?? self.defaultEntry().verseRef,
                    storyId: cached?.storyId,
                    coverImage: cover
                ), false)
                return
            }

            let slug = (story["slug"] as? String) ?? (story["id"] as? String)
            let coverUrlStr = story["cover_image_url"] as? String
            let quote = json["quote"] as? String
            let attribution = json["attribution"] as? String

            let verseText = cached?.text
                ?? quote
                ?? self.defaultEntry().verseText
            let verseRef = cached?.ref
                ?? attribution
                ?? self.defaultEntry().verseRef
            let storyId = cached?.storyId?.isEmpty == false ? cached?.storyId : slug

            let finish: (UIImage?) -> Void = { cover in
                completion(VerseEntry(
                    date: Date(),
                    verseText: verseText,
                    verseRef: verseRef,
                    storyId: storyId,
                    coverImage: cover
                ), true)
            }

            guard let coverUrlStr, let coverURL = URL(string: coverUrlStr) else {
                finish(Self.loadCachedCover(maxPixel: maxPixel))
                return
            }

            // Same cover as last time — decode the cached bytes instead of refetching.
            if let cachedData = Self.cachedCoverData(matching: coverUrlStr) {
                finish(Self.image(from: cachedData, maxPixel: maxPixel))
                return
            }

            var coverRequest = URLRequest(url: coverURL)
            coverRequest.timeoutInterval = 20

            URLSession.shared.dataTask(with: coverRequest) { imgData, _, _ in
                guard let imgData, !imgData.isEmpty,
                      let cover = Self.image(from: imgData, maxPixel: maxPixel) else {
                    finish(Self.loadCachedCover(maxPixel: maxPixel))
                    return
                }
                // Cache the original bytes so any family can resize them itself.
                if let defaults = UserDefaults(suiteName: Self.appGroupId) {
                    defaults.set(imgData, forKey: Self.coverDataKey)
                    defaults.set(coverUrlStr, forKey: Self.coverUrlKey)
                }
                finish(cover)
            }.resume()
        }.resume()
    }

    private struct CachedVerse {
        let text: String
        let ref: String
        let storyId: String?
    }

    private func readAppGroupVerse() -> CachedVerse? {
        guard let defaults = UserDefaults(suiteName: Self.appGroupId),
              let data = defaults.data(forKey: Self.verseKey),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let text = json["text"] as? String,
              let ref = json["ref"] as? String else {
            return nil
        }
        return CachedVerse(text: text, ref: ref, storyId: json["storyId"] as? String)
    }

    private static func cachedCoverData(matching url: String) -> Data? {
        guard let defaults = UserDefaults(suiteName: appGroupId),
              defaults.string(forKey: coverUrlKey) == url,
              let data = defaults.data(forKey: coverDataKey) else {
            return nil
        }
        return data
    }

    private static func loadCachedCover(maxPixel: Int) -> UIImage? {
        guard let data = UserDefaults(suiteName: appGroupId)?.data(forKey: coverDataKey) else {
            return nil
        }
        return image(from: data, maxPixel: maxPixel)
    }

    /// Decodes straight to the needed size. A full-size decode of a 1024px
    /// cover costs ~4MB, against a widget extension budget of roughly 30MB.
    static func image(from data: Data, maxPixel: Int) -> UIImage? {
        guard let source = CGImageSourceCreateWithData(data as CFData, nil) else {
            return UIImage(data: data)
        }
        let options: [CFString: Any] = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceShouldCacheImmediately: true,
            kCGImageSourceThumbnailMaxPixelSize: max(1, maxPixel),
        ]
        guard let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary) else {
            return UIImage(data: data)
        }
        return UIImage(cgImage: cgImage)
    }
}
