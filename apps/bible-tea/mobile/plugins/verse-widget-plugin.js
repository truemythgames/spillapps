const {
  withXcodeProject,
  withDangerousMod,
  withEntitlementsPlist,
  withInfoPlist,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const WIDGET_NAME = "VerseWidgetExtension";
const APP_GROUP_ID = "group.app.bibletea";
const WIDGET_BUNDLE_ID_SUFFIX = ".verse-widget";

const SWIFT_SOURCES = [
  "VerseWidgetBundle.swift",
  "VerseEntry.swift",
  "VerseWidget.swift",
  "VerseAccessoryWidget.swift",
];

const BRIDGE_SOURCES = [
  "VerseWidgetBridge.swift",
  "VerseWidgetBridge.m",
];

module.exports = function withVerseWidget(config) {
  const widgetDir = path.join(__dirname, "verse-widget");

  // 1. Add App Group entitlement to the main app
  config = withEntitlementsPlist(config, (config) => {
    const entitlements = config.modResults;
    const groups = entitlements["com.apple.security.application-groups"] || [];
    if (!groups.includes(APP_GROUP_ID)) {
      groups.push(APP_GROUP_ID);
    }
    entitlements["com.apple.security.application-groups"] = groups;
    return config;
  });

  // 2. Copy the native bridge files (VerseWidgetBridge.swift/m) into the main app target
  config = withDangerousMod(config, [
    "ios",
    (config) => {
      const projName = config.modRequest.projectName;
      const iosPath = path.join(config.modRequest.platformProjectRoot, projName);

      for (const file of BRIDGE_SOURCES) {
        const src = path.join(widgetDir, file);
        const dst = path.join(iosPath, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
        }
      }

      return config;
    },
  ]);

  // 3. Add bridge files to the main Xcode target
  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const targetKey = project.getFirstTarget().uuid;
    const projName = config.modRequest.projectName;
    const groupKey = project.findPBXGroupKey({ name: projName });

    if (groupKey) {
      const existingFiles = project.pbxGroupByName(projName)?.children || [];
      for (const file of BRIDGE_SOURCES) {
        if (!existingFiles.find((f) => f.comment === file)) {
          project.addSourceFile(`${projName}/${file}`, { target: targetKey }, groupKey);
        }
      }
    }

    return config;
  });

  // 4. Create the widget extension directory and copy Swift sources
  config = withDangerousMod(config, [
    "ios",
    (config) => {
      const extPath = path.join(config.modRequest.platformProjectRoot, WIDGET_NAME);
      fs.mkdirSync(extPath, { recursive: true });

      for (const file of SWIFT_SOURCES) {
        const src = path.join(widgetDir, file);
        const dst = path.join(extPath, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
        }
      }

      // Widget Info.plist
      const bundleId = config.ios?.bundleIdentifier + WIDGET_BUNDLE_ID_SUFFIX;
      const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleDisplayName</key>
  <string>Bible Tea Verse</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>${bundleId}</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundlePackageType</key>
  <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
  <key>CFBundleShortVersionString</key>
  <string>${config.version || "1.0.0"}</string>
  <key>CFBundleVersion</key>
  <string>${config.ios?.buildNumber || "1"}</string>
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
  </dict>
</dict>
</plist>`;
      fs.writeFileSync(path.join(extPath, "Info.plist"), infoPlist);

      // Widget entitlements
      const entitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.application-groups</key>
  <array>
    <string>${APP_GROUP_ID}</string>
  </array>
</dict>
</plist>`;
      fs.writeFileSync(path.join(extPath, `${WIDGET_NAME}.entitlements`), entitlements);

      return config;
    },
  ]);

  // 5. Add the widget extension target to the Xcode project
  config = withXcodeProject(config, (config) => {
    const project = config.modResults;

    // Bail if already added
    const existingTargets = project.pbxNativeTargetSection();
    for (const key in existingTargets) {
      if (typeof existingTargets[key] === "object" && existingTargets[key].name === `"${WIDGET_NAME}"`) {
        return config;
      }
    }

    const bundleId = config.ios?.bundleIdentifier + WIDGET_BUNDLE_ID_SUFFIX;
    const teamId = project.getFirstTarget()?.firstTarget?.buildConfigurationList
      ? undefined
      : undefined;

    // Add the widget target as an app extension
    const widgetTarget = project.addTarget(
      WIDGET_NAME,
      "app_extension",
      WIDGET_NAME,
      bundleId
    );

    // Add source files to the widget target
    for (const file of SWIFT_SOURCES) {
      project.addSourceFile(
        `${WIDGET_NAME}/${file}`,
        { target: widgetTarget.uuid },
        project.findPBXGroupKey({ name: WIDGET_NAME }) ||
          project.addPbxGroup(
            SWIFT_SOURCES.map((f) => `${WIDGET_NAME}/${f}`),
            WIDGET_NAME,
            WIDGET_NAME
          ).uuid
      );
    }

    // Configure build settings for the widget target
    const configs = project.pbxXCBuildConfigurationSection();
    for (const key in configs) {
      const cfg = configs[key];
      if (typeof cfg !== "object" || !cfg.buildSettings) continue;

      // Find configs belonging to the widget target
      const name = cfg.buildSettings.PRODUCT_NAME;
      if (name === `"${WIDGET_NAME}"` || name === WIDGET_NAME) {
        cfg.buildSettings.SWIFT_VERSION = "5.0";
        cfg.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = "16.0";
        cfg.buildSettings.CODE_SIGN_ENTITLEMENTS = `${WIDGET_NAME}/${WIDGET_NAME}.entitlements`;
        cfg.buildSettings.INFOPLIST_FILE = `${WIDGET_NAME}/Info.plist`;
        cfg.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `"${bundleId}"`;
        cfg.buildSettings.TARGETED_DEVICE_FAMILY = `"1,2"`;
        cfg.buildSettings.ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = `"AccentColor"`;
        cfg.buildSettings.ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME = `"WidgetBackground"`;
        cfg.buildSettings.GENERATE_INFOPLIST_FILE = "YES";
        cfg.buildSettings.MARKETING_VERSION = config.version || "1.0.0";
        cfg.buildSettings.CURRENT_PROJECT_VERSION = config.ios?.buildNumber || "1";
        cfg.buildSettings.SWIFT_EMIT_LOC_STRINGS = "YES";
        cfg.buildSettings.LD_RUNPATH_SEARCH_PATHS = `"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"`;

        // Copy the development team from main target if available
        const mainTarget = project.getFirstTarget();
        if (mainTarget) {
          const mainConfigs = project.pbxXCBuildConfigurationSection();
          for (const mk in mainConfigs) {
            const mcfg = mainConfigs[mk];
            if (typeof mcfg === "object" && mcfg.buildSettings?.DEVELOPMENT_TEAM) {
              cfg.buildSettings.DEVELOPMENT_TEAM = mcfg.buildSettings.DEVELOPMENT_TEAM;
              break;
            }
          }
        }
      }
    }

    // Embed the extension in the main app
    const mainTargetKey = project.getFirstTarget().uuid;
    project.addBuildPhase(
      [],
      "PBXCopyFilesBuildPhase",
      "Embed App Extensions",
      mainTargetKey,
      "app_extension"
    );

    return config;
  });

  return config;
};
