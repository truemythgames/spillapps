// https://docs.expo.dev/guides/customizing-metro/
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const monorepoRoot = path.resolve(__dirname, "../..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.watchFolders = [monorepoRoot];

module.exports = config;
