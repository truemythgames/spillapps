import Foundation
import WidgetKit
import UIKit
import React

@objc(VerseWidgetBridge)
class VerseWidgetBridge: NSObject {
    private static let appGroupId = "group.app.bibletea"
    private static let verseKey = "widget_verse_data"

    @objc static func requiresMainQueueSetup() -> Bool { false }

    /// Write today's verse JSON + download cover image into the App Group container,
    /// then tell WidgetKit to reload timelines.
    @objc func updateWidget(
        _ verseText: String,
        ref verseRef: String,
        storyId: String,
        coverUrl: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let defaults = UserDefaults(suiteName: VerseWidgetBridge.appGroupId) else {
            reject("ERR", "Cannot access App Group", nil)
            return
        }

        let payload: [String: Any] = [
            "text": verseText,
            "ref": verseRef,
            "storyId": storyId,
            "updatedAt": ISO8601DateFormatter().string(from: Date()),
        ]

        if let data = try? JSONSerialization.data(withJSONObject: payload) {
            defaults.set(data, forKey: VerseWidgetBridge.verseKey)
        }

        if !coverUrl.isEmpty, let url = URL(string: coverUrl) {
            URLSession.shared.dataTask(with: url) { data, _, _ in
                if let data = data,
                   let image = UIImage(data: data),
                   let jpegData = image.jpegData(compressionQuality: 0.8),
                   let containerURL = FileManager.default.containerURL(
                       forSecurityApplicationGroupIdentifier: VerseWidgetBridge.appGroupId
                   ) {
                    let fileURL = containerURL.appendingPathComponent("widget_cover.jpg")
                    try? jpegData.write(to: fileURL)
                }

                DispatchQueue.main.async {
                    if #available(iOS 14.0, *) {
                        WidgetCenter.shared.reloadAllTimelines()
                    }
                }
                resolve(true)
            }.resume()
        } else {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
            resolve(true)
        }
    }

    /// Quick refresh without downloading a new cover (reuses cached image).
    @objc func refreshTimeline(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        resolve(true)
    }

    /// Check whether at least one Bible Tea widget is on the user's home/lock screen.
    @objc func isWidgetInstalled(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.getCurrentConfigurations { result in
                switch result {
                case .success(let configs):
                    resolve(configs.count > 0)
                case .failure:
                    resolve(false)
                }
            }
        } else {
            resolve(false)
        }
    }
}
