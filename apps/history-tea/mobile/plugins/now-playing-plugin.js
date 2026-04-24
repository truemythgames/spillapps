const {
  withXcodeProject,
  withDangerousMod,
  withAndroidManifest,
  withMainApplication,
  withAppBuildGradle,
  AndroidConfig,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const SWIFT_CODE = `
import Foundation
import MediaPlayer
import UIKit
import AVFoundation
import React

@objc(NowPlayingBridge)
class NowPlayingBridge: RCTEventEmitter {
  private static var instance: NowPlayingBridge?
  private static var hasActiveListeners = false
  private static var ready = false

  override static func requiresMainQueueSetup() -> Bool { true }

  override func supportedEvents() -> [String]! {
    ["onRemotePlay", "onRemotePause", "onRemoteSkipForward", "onRemoteSkipBackward", "onRemoteSeek"]
  }

  override func startObserving() {
    NowPlayingBridge.instance = self
    NowPlayingBridge.hasActiveListeners = true
  }
  override func stopObserving() {
    NowPlayingBridge.hasActiveListeners = false
  }

  private static func ensureReady() {
    guard !ready else { return }
    ready = true
    UIApplication.shared.beginReceivingRemoteControlEvents()

    do {
      let s = AVAudioSession.sharedInstance()
      try s.setCategory(.playback, mode: .default, options: [])
      try s.setActive(true)
    } catch {}

    let cc = MPRemoteCommandCenter.shared()
    cc.playCommand.isEnabled = true
    cc.playCommand.addTarget { _ in
      NowPlayingBridge.emit("onRemotePlay")
      return .success
    }
    cc.pauseCommand.isEnabled = true
    cc.pauseCommand.addTarget { _ in
      NowPlayingBridge.emit("onRemotePause")
      return .success
    }
    cc.togglePlayPauseCommand.isEnabled = true
    cc.togglePlayPauseCommand.addTarget { _ in
      NowPlayingBridge.emit("onRemotePause")
      return .success
    }
    cc.skipForwardCommand.isEnabled = true
    cc.skipForwardCommand.preferredIntervals = [15]
    cc.skipForwardCommand.addTarget { _ in
      NowPlayingBridge.emit("onRemoteSkipForward")
      return .success
    }
    cc.skipBackwardCommand.isEnabled = true
    cc.skipBackwardCommand.preferredIntervals = [15]
    cc.skipBackwardCommand.addTarget { _ in
      NowPlayingBridge.emit("onRemoteSkipBackward")
      return .success
    }
    cc.changePlaybackPositionCommand.isEnabled = true
    cc.changePlaybackPositionCommand.addTarget { event in
      guard let e = event as? MPChangePlaybackPositionCommandEvent else { return .commandFailed }
      NowPlayingBridge.emit("onRemoteSeek", body: ["position": e.positionTime])
      return .success
    }
  }

  private static func emit(_ name: String, body: Any? = nil) {
    guard hasActiveListeners, let inst = instance else { return }
    inst.sendEvent(withName: name, body: body)
  }

  @objc func updateNowPlaying(_ info: NSDictionary) {
    DispatchQueue.main.async {
      NowPlayingBridge.ensureReady()

      var np = [String: Any]()
      if let t = info["title"] as? String { np[MPMediaItemPropertyTitle] = t }
      if let a = info["artist"] as? String { np[MPMediaItemPropertyArtist] = a }
      if let d = info["duration"] as? Double { np[MPMediaItemPropertyPlaybackDuration] = d }
      if let p = info["position"] as? Double { np[MPNowPlayingInfoPropertyElapsedPlaybackTime] = p }
      if let r = info["rate"] as? Double { np[MPNowPlayingInfoPropertyPlaybackRate] = r }

      MPNowPlayingInfoCenter.default().nowPlayingInfo = np

      if let url = info["artworkUrl"] as? String, let u = URL(string: url) {
        URLSession.shared.dataTask(with: u) { data, _, _ in
          guard let d = data, let img = UIImage(data: d) else { return }
          let art = MPMediaItemArtwork(boundsSize: img.size) { _ in img }
          DispatchQueue.main.async {
            var cur = MPNowPlayingInfoCenter.default().nowPlayingInfo ?? np
            cur[MPMediaItemPropertyArtwork] = art
            MPNowPlayingInfoCenter.default().nowPlayingInfo = cur
          }
        }.resume()
      }
    }
  }

  @objc func clearNowPlaying() {
    DispatchQueue.main.async {
      MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
    }
  }

  @objc func ping(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      NowPlayingBridge.ensureReady()
      resolve("pong")
    }
  }
}
`;

const OBJC_BRIDGE = `
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(NowPlayingBridge, RCTEventEmitter)
RCT_EXTERN_METHOD(updateNowPlaying:(NSDictionary *)info)
RCT_EXTERN_METHOD(clearNowPlaying)
RCT_EXTERN_METHOD(ping:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
@end
`;

const ANDROID_MODULE_KT = fs.readFileSync(
  path.join(__dirname, "native-android/NowPlayingBridgeModule.kt"),
  "utf8",
);
const ANDROID_SERVICE_KT = fs.readFileSync(
  path.join(__dirname, "native-android/PlaybackService.kt"),
  "utf8",
);
const ANDROID_PACKAGE_KT = fs.readFileSync(
  path.join(__dirname, "native-android/NowPlayingBridgePackage.kt"),
  "utf8",
);

module.exports = function withNowPlaying(config) {
  // ANDROID: write Kotlin sources during prebuild into the package matching android.package
  config = withDangerousMod(config, [
    "android",
    (config) => {
      const androidPkg = config.android?.package || "app.historytea";
      const pkgPath = androidPkg.replace(/\./g, "/");
      const pkgDir = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/java",
        pkgPath,
      );
      fs.mkdirSync(pkgDir, { recursive: true });
      const rewrite = (src) => src.replace(/^package\s+[\w.]+/m, `package ${androidPkg}`);
      fs.writeFileSync(path.join(pkgDir, "NowPlayingBridgeModule.kt"), rewrite(ANDROID_MODULE_KT));
      fs.writeFileSync(path.join(pkgDir, "PlaybackService.kt"), rewrite(ANDROID_SERVICE_KT));
      fs.writeFileSync(path.join(pkgDir, "NowPlayingBridgePackage.kt"), rewrite(ANDROID_PACKAGE_KT));
      return config;
    },
  ]);

  // ANDROID: manifest permissions + service + media button receiver
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    const perms = [
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.WAKE_LOCK",
    ];
    manifest["uses-permission"] = manifest["uses-permission"] || [];
    for (const name of perms) {
      if (!manifest["uses-permission"].find((p) => p.$["android:name"] === name)) {
        manifest["uses-permission"].push({ $: { "android:name": name } });
      }
    }

    const app = manifest.application?.[0];
    if (app) {
      app.service = app.service || [];
      if (!app.service.find((s) => s.$["android:name"] === ".PlaybackService")) {
        app.service.push({
          $: {
            "android:name": ".PlaybackService",
            "android:exported": "false",
            "android:foregroundServiceType": "mediaPlayback",
          },
          "intent-filter": [
            { action: [{ $: { "android:name": "android.intent.action.MEDIA_BUTTON" } }] },
          ],
        });
      }
      app.receiver = app.receiver || [];
      if (
        !app.receiver.find((r) => r.$["android:name"] === "androidx.media.session.MediaButtonReceiver")
      ) {
        app.receiver.push({
          $: {
            "android:name": "androidx.media.session.MediaButtonReceiver",
            "android:exported": "true",
          },
          "intent-filter": [
            { action: [{ $: { "android:name": "android.intent.action.MEDIA_BUTTON" } }] },
          ],
        });
      }
    }
    return config;
  });

  // ANDROID: add androidx.media dependency
  config = withAppBuildGradle(config, (config) => {
    const needle = 'implementation("androidx.media:media:1.7.0")';
    if (!config.modResults.contents.includes(needle)) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    ${needle}`,
      );
    }
    return config;
  });

  // ANDROID: register package in MainApplication.kt
  config = withMainApplication(config, (config) => {
    let src = config.modResults.contents;
    if (!src.includes("NowPlayingBridgePackage()")) {
      src = src.replace(
        /val packages = PackageList\(this\)\.packages\s*\n/,
        "val packages = PackageList(this).packages\n            packages.add(NowPlayingBridgePackage())\n",
      );
    }
    config.modResults.contents = src;
    return config;
  });

  // iOS
  config = withDangerousMod(config, [
    "ios",
    (config) => {
      const iosPath = path.join(config.modRequest.platformProjectRoot, config.modRequest.projectName);
      fs.writeFileSync(path.join(iosPath, "NowPlayingBridge.swift"), SWIFT_CODE.trim());
      fs.writeFileSync(path.join(iosPath, "NowPlayingBridge.m"), OBJC_BRIDGE.trim());

      const bridgingHeader = path.join(iosPath, `${config.modRequest.projectName}-Bridging-Header.h`);
      let header = "";
      try { header = fs.readFileSync(bridgingHeader, "utf8"); } catch {}
      if (!header.includes("RCTBridgeModule")) {
        header += '\n#import <React/RCTBridgeModule.h>\n#import <React/RCTEventEmitter.h>\n';
        fs.writeFileSync(bridgingHeader, header);
      }
      return config;
    },
  ]);

  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const targetKey = project.getFirstTarget().uuid;
    const groupKey = project.findPBXGroupKey({ name: config.modRequest.projectName });

    if (groupKey) {
      const projName = config.modRequest.projectName;
      const existingFiles = project.pbxGroupByName(projName)?.children || [];
      if (!existingFiles.find((f) => f.comment === "NowPlayingBridge.swift")) {
        project.addSourceFile(`${projName}/NowPlayingBridge.swift`, { target: targetKey }, groupKey);
      }
      if (!existingFiles.find((f) => f.comment === "NowPlayingBridge.m")) {
        project.addSourceFile(`${projName}/NowPlayingBridge.m`, { target: targetKey }, groupKey);
      }
    }

    return config;
  });

  return config;
};
