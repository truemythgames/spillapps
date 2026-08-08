const {
  withDangerousMod,
  withAndroidManifest,
  withMainApplication,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const WIDGET_DIR = path.join(__dirname, "native-android", "widget");

module.exports = function withAndroidVerseWidget(config) {
  // 1. Copy Kotlin source files into the Android project
  config = withDangerousMod(config, [
    "android",
    (config) => {
      const pkgDir = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/java/app/bibletea"
      );
      fs.mkdirSync(pkgDir, { recursive: true });

      const ktFiles = [
        "VerseWidgetProvider.kt",
        "VerseWidgetBridgeModule.kt",
        "VerseWidgetBridgePackage.kt",
      ];

      for (const file of ktFiles) {
        const src = path.join(WIDGET_DIR, file);
        const dst = path.join(pkgDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
        }
      }

      return config;
    },
  ]);

  // 2. Copy resource files (layouts, drawables, xml metadata, values)
  config = withDangerousMod(config, [
    "android",
    (config) => {
      const resRoot = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/res"
      );

      const resDirs = ["layout", "drawable", "xml", "values"];

      for (const dir of resDirs) {
        const srcDir = path.join(WIDGET_DIR, "res", dir);
        if (!fs.existsSync(srcDir)) continue;

        const dstDir = path.join(resRoot, dir);
        fs.mkdirSync(dstDir, { recursive: true });

        const files = fs.readdirSync(srcDir);
        for (const file of files) {
          const src = path.join(srcDir, file);
          const dst = path.join(dstDir, file);

          if (dir === "values" && fs.existsSync(dst)) {
            // Merge string resources into existing values file
            const srcContent = fs.readFileSync(src, "utf8");
            let dstContent = fs.readFileSync(dst, "utf8");

            const stringMatches = srcContent.match(/<string name="[^"]+">.*?<\/string>/g);
            if (stringMatches) {
              for (const stringTag of stringMatches) {
                const nameMatch = stringTag.match(/name="([^"]+)"/);
                if (nameMatch && !dstContent.includes(`name="${nameMatch[1]}"`)) {
                  dstContent = dstContent.replace(
                    "</resources>",
                    `    ${stringTag}\n</resources>`
                  );
                }
              }
              fs.writeFileSync(dst, dstContent);
            }
          } else {
            fs.copyFileSync(src, dst);
          }
        }
      }

      return config;
    },
  ]);

  // 3. Register the widget receiver in AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const app = manifest.application?.[0];
    if (!app) return config;

    app.receiver = app.receiver || [];

    const widgetReceiverName = ".VerseWidgetProvider";
    if (!app.receiver.find((r) => r.$["android:name"] === widgetReceiverName)) {
      app.receiver.push({
        $: {
          "android:name": widgetReceiverName,
          "android:exported": "true",
          "android:label": "Verse of the Day",
        },
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name": "android.appwidget.action.APPWIDGET_UPDATE",
                },
              },
            ],
          },
        ],
        "meta-data": [
          {
            $: {
              "android:name": "android.appwidget.provider",
              "android:resource": "@xml/verse_widget_info",
            },
          },
        ],
      });
    }

    return config;
  });

  // 4. Register the bridge package in MainApplication
  config = withMainApplication(config, (config) => {
    let src = config.modResults.contents;
    if (!src.includes("VerseWidgetBridgePackage()")) {
      src = src.replace(
        /val packages = PackageList\(this\)\.packages\s*\n/,
        "val packages = PackageList(this).packages\n            packages.add(VerseWidgetBridgePackage())\n"
      );
    }
    config.modResults.contents = src;
    return config;
  });

  return config;
};
