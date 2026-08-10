import WidgetKit
import SwiftUI

private extension Color {
    static let btBackground = Color(red: 0.039, green: 0.039, blue: 0.059)
    static let btPrimary = Color(red: 0.784, green: 0.635, blue: 1.0)
    static let btAccent = Color(red: 1.0, green: 0.82, blue: 0.4)
    static let btGradientStart = Color(red: 0.784, green: 0.635, blue: 1.0)
    static let btGradientEnd = Color(red: 0.42, green: 0.36, blue: 0.906)
}

struct VerseWidget: Widget {
    let kind = "VerseWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: VerseProvider()) { entry in
            VerseWidgetView(entry: entry)
        }
        .configurationDisplayName("Verse of the Day")
        .description("Daily verse with story cover — small, medium, or large.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

struct VerseWidgetView: View {
    @Environment(\.widgetFamily) var family
    let entry: VerseEntry

    var body: some View {
        Group {
            switch family {
            case .systemLarge:
                largeLayout
            case .systemMedium:
                mediumLayout
            default:
                smallLayout
            }
        }
        // Three slashes so path is /story/… (not host=story)
        .widgetURL(entry.deepLink)
        .modifier(WidgetContainerBackground())
    }

    private var smallLayout: some View {
        ZStack {
            coverLayer
            VStack(alignment: .leading, spacing: 4) {
                Text("VERSE OF THE DAY")
                    .font(.system(size: 8, weight: .heavy))
                    .foregroundColor(.btAccent)
                    .kerning(0.8)

                Spacer(minLength: 0)

                Text(entry.verseText)
                    .font(.system(size: 13, weight: .semibold, design: .serif))
                    .foregroundColor(.white)
                    .lineLimit(4)
                    .minimumScaleFactor(0.7)
                    .shadow(color: .black.opacity(0.6), radius: 2, y: 1)

                Text(entry.verseRef)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.btAccent)
                    .shadow(color: .black.opacity(0.6), radius: 2, y: 1)
            }
            .padding(12)
        }
    }

    private var mediumLayout: some View {
        ZStack {
            coverLayer
            VStack(alignment: .leading, spacing: 6) {
                Text("VERSE OF THE DAY")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.btAccent)
                    .kerning(1)

                Spacer(minLength: 0)

                Text(entry.verseText)
                    .font(.system(size: 15, weight: .semibold, design: .serif))
                    .foregroundColor(.white)
                    .lineLimit(3)
                    .minimumScaleFactor(0.75)
                    .shadow(color: .black.opacity(0.6), radius: 2, y: 1)

                Text(entry.verseRef)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.btAccent)
                    .shadow(color: .black.opacity(0.6), radius: 2, y: 1)

                Spacer(minLength: 0)

                Text("Tap to listen")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
            }
            .padding(14)
        }
    }

    private var largeLayout: some View {
        ZStack {
            coverLayer
            VStack(alignment: .leading, spacing: 0) {
                Text("VERSE OF THE DAY")
                    .font(.system(size: 10, weight: .heavy))
                    .foregroundColor(.btAccent)
                    .kerning(1.2)

                Spacer(minLength: 8)

                Text(entry.verseText)
                    .font(.system(size: 22, weight: .semibold, design: .serif))
                    .foregroundColor(.white)
                    .lineLimit(7)
                    .minimumScaleFactor(0.65)
                    .shadow(color: .black.opacity(0.55), radius: 3, y: 1)

                Text(entry.verseRef)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.btAccent)
                    .padding(.top, 8)
                    .shadow(color: .black.opacity(0.55), radius: 2, y: 1)

                Spacer(minLength: 0)

                Text("Tap to listen")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
            }
            .padding(18)
        }
    }

    /// Reliable full-bleed image: clear + overlay (scaledToFill alone often renders blank in widgets).
    @ViewBuilder
    private var coverLayer: some View {
        Group {
            if let img = entry.coverImage {
                Color.clear
                    .overlay(
                        Image(uiImage: img)
                            .resizable()
                            .scaledToFill()
                    )
                    .clipped()
            } else {
                LinearGradient(
                    colors: [.btGradientStart, .btGradientEnd, .btBackground],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
        }
        .overlay(
            LinearGradient(
                colors: [Color.black.opacity(0.2), Color.black.opacity(0.78)],
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }
}

private struct WidgetContainerBackground: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) {
                Color.btBackground
            }
        } else {
            content
        }
    }
}

extension VerseEntry {
    var deepLink: URL {
        // Three slashes → path "/story/…". Also include query fallback for the JS parser.
        if let storyId = storyId, !storyId.isEmpty {
            let encoded = storyId.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? storyId
            return URL(string: "bibletea:///story/\(encoded)?storyId=\(encoded)")!
        }
        return URL(string: "bibletea:///")!
    }
}
