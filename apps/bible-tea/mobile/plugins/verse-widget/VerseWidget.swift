import WidgetKit
import SwiftUI

// MARK: – Colors matching the app theme

private extension Color {
    static let btBackground   = Color(red: 0.039, green: 0.039, blue: 0.059)   // #0A0A0F
    static let btSurface      = Color(red: 0.078, green: 0.078, blue: 0.125)   // #141420
    static let btPrimary      = Color(red: 0.784, green: 0.635, blue: 1.0)     // #C8A2FF
    static let btAccent       = Color(red: 1.0,   green: 0.82,  blue: 0.4)     // #FFD166
    static let btText         = Color.white
    static let btTextSecondary = Color(red: 0.627, green: 0.627, blue: 0.722)  // #A0A0B8
    static let btGradientStart = Color(red: 0.784, green: 0.635, blue: 1.0)    // #C8A2FF
    static let btGradientEnd   = Color(red: 0.42,  green: 0.36,  blue: 0.906)  // #6B5CE7
}

// MARK: – Home Screen Widget (Small + Medium)

struct VerseWidget: Widget {
    let kind = "VerseWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: VerseProvider()) { entry in
            VerseWidgetView(entry: entry)
        }
        .configurationDisplayName("Verse of the Day")
        .description("A daily Bible verse from Bible Tea.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct VerseWidgetView: View {
    @Environment(\.widgetFamily) var family
    @Environment(\.colorScheme) var colorScheme
    let entry: VerseEntry

    private var isDark: Bool { colorScheme == .dark }

    var body: some View {
        Group {
            if family == .systemMedium {
                mediumLayout
            } else {
                smallLayout
            }
        }
    }

    // MARK: Small (2×2)
    // Always uses cover image BG with dark scrim → white text

    private var smallLayout: some View {
        ZStack {
            smallBackground
            VStack(alignment: .leading, spacing: 6) {
                Spacer(minLength: 0)

                Text(entry.verseText)
                    .font(.system(size: 13, weight: .medium, design: .serif))
                    .foregroundColor(.white)
                    .lineLimit(4)
                    .minimumScaleFactor(0.8)

                Text(entry.verseRef)
                    .font(.system(size: 10, weight: .semibold, design: .default))
                    .foregroundColor(.btAccent)

                Spacer(minLength: 0)

                HStack {
                    Spacer()
                    Text("Bible Tea")
                        .font(.system(size: 8, weight: .bold, design: .default))
                        .foregroundColor(.white.opacity(0.45))
                }
            }
            .padding(14)
        }
        .widgetURL(widgetDeepLink)
    }

    // MARK: Medium (4×2)

    private var mediumLayout: some View {
        ZStack {
            mediumBackground
            HStack(spacing: 0) {
                if let img = entry.coverImage {
                    Image(uiImage: img)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 120)
                        .clipped()
                } else {
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [.btGradientStart, .btGradientEnd],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 120)
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("VERSE OF THE DAY")
                        .font(.system(size: 9, weight: .bold, design: .default))
                        .foregroundColor(isDark ? .btAccent : Color(red: 0.75, green: 0.55, blue: 0.0))
                        .kerning(1.2)

                    Spacer(minLength: 0)

                    Text(entry.verseText)
                        .font(.system(size: 14, weight: .medium, design: .serif))
                        .foregroundColor(isDark ? .white : Color(red: 0.12, green: 0.12, blue: 0.14))
                        .lineLimit(3)
                        .minimumScaleFactor(0.8)

                    Text(entry.verseRef)
                        .font(.system(size: 11, weight: .semibold, design: .default))
                        .foregroundColor(isDark ? .btPrimary : Color(red: 0.48, green: 0.30, blue: 0.78))

                    Spacer(minLength: 0)

                    HStack {
                        Text("Tap to hear today's story")
                            .font(.system(size: 9, weight: .medium, design: .default))
                            .foregroundColor(isDark ? .btTextSecondary : Color(red: 0.45, green: 0.45, blue: 0.5))
                        Spacer()
                        Text("🍵")
                            .font(.system(size: 12))
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
            }
        }
        .widgetURL(widgetDeepLink)
    }

    // MARK: Backgrounds

    @ViewBuilder
    private var smallBackground: some View {
        if let img = entry.coverImage {
            ZStack {
                Image(uiImage: img)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                LinearGradient(
                    colors: [
                        Color.black.opacity(0.55),
                        Color.black.opacity(0.82)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
            }
        } else {
            // No cover: gradient fallback
            LinearGradient(
                colors: [
                    Color(red: 0.15, green: 0.12, blue: 0.25),
                    .btBackground
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }

    @ViewBuilder
    private var mediumBackground: some View {
        if isDark {
            Color.btBackground
        } else {
            LinearGradient(
                colors: [
                    Color(red: 0.97, green: 0.95, blue: 1.0),
                    Color.white
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }

    private var widgetDeepLink: URL {
        if let storyId = entry.storyId {
            return URL(string: "bibletea://story/\(storyId)")!
        }
        return URL(string: "bibletea://")!
    }
}
