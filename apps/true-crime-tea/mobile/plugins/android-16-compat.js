const { withAndroidManifest, withAppBuildGradle } = require("expo/config-plugins");

/**
 * Android 16 (targetSdk 36) compatibility tweaks:
 *
 * 1. Opt out of predictive back. When targeting SDK 36, predictive back is
 *    enabled by default on Android 16 devices, which breaks React Native's
 *    classic back-button handling (onBackPressed / KEYCODE_BACK are no longer
 *    dispatched). RN 0.79 doesn't support predictive back, so keep it off.
 *
 * 2. Pin androidx.core to 1.16.0. Transitive dependencies pull in
 *    androidx.core 1.17.0, which requires AGP 8.9.1+, but Expo SDK 53 / RN 0.79
 *    ships AGP 8.8.2 (fails :app:checkDebugAarMetadata otherwise).
 */
module.exports = function withAndroid16Compat(config) {
  config = withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (app) {
      app.$["android:enableOnBackInvokedCallback"] = "false";
    }
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    const marker = "androidx.core:core:1.16.0";
    if (!config.modResults.contents.includes(marker)) {
      config.modResults.contents += `
// Pin androidx.core: newer transitive pulls (1.17.0) require AGP 8.9.1+,
// but Expo SDK 53 / RN 0.79 ships AGP 8.8.2.
configurations.all {
    resolutionStrategy {
        force "androidx.core:core:1.16.0"
        force "androidx.core:core-ktx:1.16.0"
    }
}
`;
    }
    return config;
  });

  return config;
};
