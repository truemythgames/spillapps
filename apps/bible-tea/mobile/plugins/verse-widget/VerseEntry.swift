import WidgetKit
import SwiftUI
import UIKit

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

    func placeholder(in context: Context) -> VerseEntry {
        defaultEntry()
    }

    func getSnapshot(in context: Context, completion: @escaping (VerseEntry) -> Void) {
        completion(loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VerseEntry>) -> Void) {
        let entry = loadEntry()

        let tomorrow = Calendar.current.startOfDay(for: Date()).addingTimeInterval(86400)
        let timeline = Timeline(entries: [entry], policy: .after(tomorrow))
        completion(timeline)
    }

    private func defaultEntry() -> VerseEntry {
        VerseEntry(
            date: Date(),
            verseText: "Trust in the Lord with all your heart.",
            verseRef: "Proverbs 3:5",
            storyId: nil,
            coverImage: nil
        )
    }

    private func loadEntry() -> VerseEntry {
        guard let defaults = UserDefaults(suiteName: VerseProvider.appGroupId),
              let data = defaults.data(forKey: VerseProvider.verseKey),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return defaultEntry()
        }

        let text = json["text"] as? String ?? "Trust in the Lord with all your heart."
        let ref = json["ref"] as? String ?? "Proverbs 3:5"
        let storyId = json["storyId"] as? String

        var coverImage: UIImage? = nil
        if let containerURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: VerseProvider.appGroupId
        ) {
            let imageURL = containerURL.appendingPathComponent("widget_cover.jpg")
            if let imageData = try? Data(contentsOf: imageURL) {
                coverImage = UIImage(data: imageData)
            }
        }

        return VerseEntry(
            date: Date(),
            verseText: text,
            verseRef: ref,
            storyId: storyId,
            coverImage: coverImage
        )
    }
}
