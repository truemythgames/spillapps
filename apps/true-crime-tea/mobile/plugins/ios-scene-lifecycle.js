/**
 * iOS 27 aborts apps that create UIWindow from AppDelegate with no scene lifecycle.
 * Moves React Native startup into SceneDelegate and declares UIApplicationSceneManifest.
 */
const { withDangerousMod, withInfoPlist } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const SCENE_DELEGATE = `
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else {
      return
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window

    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: appDelegate.launchOptions
    )

    for context in connectionOptions.urlContexts {
      _ = appDelegate.application(UIApplication.shared, open: context.url, options: [:])
    }
    for activity in connectionOptions.userActivities {
      _ = appDelegate.application(
        UIApplication.shared,
        continue: activity,
        restorationHandler: { _ in }
      )
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    for context in URLContexts {
      _ = appDelegate.application(UIApplication.shared, open: context.url, options: [:])
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    _ = appDelegate.application(
      UIApplication.shared,
      continue: userActivity,
      restorationHandler: { _ in }
    )
  }
}
`.trim();

function patchAppDelegate(contents) {
  if (contents.includes("class SceneDelegate")) return contents;

  let next = contents;
  if (!next.includes("var launchOptions:")) {
    next = next.replace(
      "var reactNativeFactory: RCTReactNativeFactory?\n",
      "var reactNativeFactory: RCTReactNativeFactory?\n  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?\n"
    );
  }

  next = next.replace(
    /reactNativeFactory = factory\n\s*bindReactNativeFactory\(factory\)/,
    "reactNativeFactory = factory\n    self.launchOptions = launchOptions\n    bindReactNativeFactory(factory)"
  );

  // Drop AppDelegate window creation + startReactNative; keep Firebase configure.
  next = next.replace(
    /#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n([\s\S]*?)factory\.startReactNative\(\n\s*withModuleName: "main",\n\s*in: window,\n\s*launchOptions: launchOptions\)\n#endif/,
    `#if os(iOS) || os(tvOS)
$1#endif

    // The window is created by SceneDelegate. iOS 27 aborts at launch unless the app
    // adopts the UIScene lifecycle.`
  );

  if (!next.includes("class SceneDelegate")) {
    next = `${next.trimEnd()}\n\n${SCENE_DELEGATE}\n`;
  }
  return next;
}

function withIosSceneLifecycle(config) {
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
          },
        ],
      },
    };
    return cfg;
  });

  config = withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const iosRoot = path.join(cfg.modRequest.platformProjectRoot);
      const entries = fs.readdirSync(iosRoot, { withFileTypes: true });
      const appDir = entries.find(
        (e) => e.isDirectory() && fs.existsSync(path.join(iosRoot, e.name, "AppDelegate.swift"))
      );
      if (!appDir) return cfg;
      const file = path.join(iosRoot, appDir.name, "AppDelegate.swift");
      const before = fs.readFileSync(file, "utf8");
      const after = patchAppDelegate(before);
      if (after !== before) fs.writeFileSync(file, after);
      return cfg;
    },
  ]);

  return config;
}

module.exports = withIosSceneLifecycle;
