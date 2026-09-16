// https://docs.expo.dev/guides/customizing-metro/
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const monorepoRoot = path.resolve(__dirname, "../..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.watchFolders = [monorepoRoot];

const screensPath = path.resolve(__dirname, "node_modules/react-native-screens");
const rootScreens = path.resolve(monorepoRoot, "node_modules/react-native-screens");
const defaultResolve = config.resolver.resolveRequest;

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "react-native-screens": screensPath,
};

config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : config.resolver.blockList
      ? [config.resolver.blockList]
      : []),
  new RegExp(`${rootScreens.replace(/[/\\]/g, "[/\\\\]")}[/\\\\].*`),
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "react-native-screens" ||
    moduleName.startsWith("react-native-screens/")
  ) {
    return context.resolveRequest(
      {
        ...context,
        originModulePath: path.join(screensPath, "package.json"),
        resolveRequest: undefined,
      },
      moduleName,
      platform,
    );
  }
  if (defaultResolve) {
    return defaultResolve(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
