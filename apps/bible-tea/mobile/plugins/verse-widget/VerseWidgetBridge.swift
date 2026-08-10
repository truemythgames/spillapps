import Foundation
import WidgetKit
import UIKit
import ImageIO
import React

@objc(VerseWidgetBridge)
class VerseWidgetBridge: NSObject {
    private static let appGroupId = "group.app.bibletea"
    private static let verseKey = "widget_verse_data"
    private static let coverDataKey = "widget_cover_data"
    private static let coverUrlKey = "widget_cover_url"
    private static let coverFileName = "widget_cover.jpg"

    @objc static func requiresMainQueueSetup() -> Bool { false }

    @objc func updateWidget(
        _ verseText: String,
        ref verseRef: String,
        storyId: String,
        coverUrl: String,
        coverBase64: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let defaults = UserDefaults(suiteName: VerseWidgetBridge.appGroupId) else {
            reject("ERR_APP_GROUP", "Cannot access App Group group.app.bibletea", nil)
            return
        }

        let payload: [String: Any] = [
            "text": verseText,
            "ref": verseRef,
            "storyId": storyId,
            "coverUrl": coverUrl,
            "updatedAt": ISO8601DateFormatter().string(from: Date()),
        ]
        if let data = try? JSONSerialization.data(withJSONObject: payload) {
            defaults.set(data, forKey: VerseWidgetBridge.verseKey)
        }

        // Prefer JS-provided bytes (already fetched). Store in UserDefaults — same
        // channel that successfully syncs verse text — plus App Group file.
        if !coverBase64.isEmpty,
           let raw = Data(base64Encoded: coverBase64, options: .ignoreUnknownCharacters),
           !raw.isEmpty {
            Self.persistCover(raw, url: coverUrl, defaults: defaults)
            defaults.synchronize()
            reloadTimelines()
            resolve(true)
            return
        }

        defaults.synchronize()

        guard !coverUrl.isEmpty, let url = URL(string: coverUrl) else {
            reloadTimelines()
            resolve(true)
            return
        }

        downloadImage(from: url, defaults: defaults, attempt: 1) { _ in
            self.reloadTimelines()
            resolve(true)
        }
    }

    private func downloadImage(from url: URL, defaults: UserDefaults, attempt: Int, completion: @escaping (Bool) -> Void) {
        var request = URLRequest(url: url)
        request.timeoutInterval = 20
        request.cachePolicy = .reloadIgnoringLocalCacheData

        URLSession.shared.dataTask(with: request) { data, response, _ in
            let status = (response as? HTTPURLResponse)?.statusCode ?? 0
            guard let data = data, !data.isEmpty, status == 0 || (200...299).contains(status) else {
                if attempt < 3 {
                    DispatchQueue.global().asyncAfter(deadline: .now() + Double(attempt)) {
                        self.downloadImage(from: url, defaults: defaults, attempt: attempt + 1, completion: completion)
                    }
                } else {
                    completion(false)
                }
                return
            }

            Self.persistCover(data, url: url.absoluteString, defaults: defaults)
            defaults.synchronize()
            completion(true)
        }.resume()
    }

    private static func persistCover(_ data: Data, url: String, defaults: UserDefaults) {
        let jpeg = jpegData(from: data) ?? data
        defaults.set(jpeg, forKey: coverDataKey)
        // Must stay in step with the bytes, or the widget will reuse this
        // image for a different story's cover URL.
        defaults.set(url, forKey: coverUrlKey)

        if let containerURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupId
        ) {
            try? jpeg.write(
                to: containerURL.appendingPathComponent(coverFileName),
                options: .atomic
            )
        }
    }

    private static func jpegData(from data: Data) -> Data? {
        if let image = UIImage(data: data), let jpeg = image.jpegData(compressionQuality: 0.82) {
            return jpeg
        }
        guard let source = CGImageSourceCreateWithData(data as CFData, nil),
              let cgImage = CGImageSourceCreateImageAtIndex(source, 0, [
                  kCGImageSourceShouldCache: false
              ] as CFDictionary) else {
            return nil
        }
        return UIImage(cgImage: cgImage).jpegData(compressionQuality: 0.82)
    }

    private func reloadTimelines() {
        DispatchQueue.main.async {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }

    @objc func refreshTimeline(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        reloadTimelines()
        resolve(true)
    }

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
