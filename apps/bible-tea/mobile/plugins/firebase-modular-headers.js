const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const PODS_TO_PATCH = [
  "GoogleUtilities",
  "GoogleDataTransport",
  "nanopb",
  "FirebaseCore",
  "FirebaseCoreExtension",
  "FirebaseInstallations",
  "FirebaseSessions",
  "FirebaseCoreInternal",
  "FirebaseCrashlytics",
];

module.exports = function withFirebaseModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let contents = fs.readFileSync(podfilePath, "utf8");

      const podLines = PODS_TO_PATCH.map(
        (p) => `  pod '${p}', :modular_headers => true`
      ).join("\n");

      contents = contents.replace(
        "  use_expo_modules!\n",
        `  use_expo_modules!\n\n${podLines}\n`
      );

      fs.writeFileSync(podfilePath, contents);
      return config;
    },
  ]);
};
