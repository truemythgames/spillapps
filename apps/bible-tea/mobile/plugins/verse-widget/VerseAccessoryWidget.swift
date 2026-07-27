import WidgetKit
import SwiftUI

// MARK: – Lock Screen Widgets (iOS 16+)

@available(iOSApplicationExtension 16.1, *)
struct VerseAccessoryWidget: Widget {
    let kind = "VerseAccessoryWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: VerseProvider()) { entry in
            VerseAccessoryView(entry: entry)
        }
        .configurationDisplayName("Verse of the Day")
        .description("A daily verse on your lock screen.")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular])
    }
}

@available(iOSApplicationExtension 16.1, *)
struct VerseAccessoryView: View {
    @Environment(\.widgetFamily) var family
    let entry: VerseEntry

    var body: some View {
        switch family {
        case .accessoryCircular:
            circularLayout
        case .accessoryRectangular:
            rectangularLayout
        default:
            EmptyView()
        }
    }

    // MARK: Circular — app icon + cross/tea emoji
    private var circularLayout: some View {
        ZStack {
            AccessoryWidgetBackground()
            VStack(spacing: 1) {
                Text("🍵")
                    .font(.system(size: 20))
                Text("BT")
                    .font(.system(size: 9, weight: .heavy, design: .default))
                    .foregroundColor(.primary)
            }
        }
        .widgetURL(URL(string: "bibletea://")!)
    }

    // MARK: Rectangular — verse text + reference
    private var rectangularLayout: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(entry.verseText)
                .font(.system(size: 12, weight: .medium, design: .serif))
                .lineLimit(2)
                .minimumScaleFactor(0.8)

            Text(entry.verseRef)
                .font(.system(size: 10, weight: .semibold, design: .default))
                .foregroundColor(.secondary)
        }
        .widgetURL(widgetDeepLink)
    }

    private var widgetDeepLink: URL {
        if let storyId = entry.storyId {
            return URL(string: "bibletea://story/\(storyId)")!
        }
        return URL(string: "bibletea://")!
    }
}
