// Metro config for a pnpm monorepo: watch the workspace root so Metro can
// resolve @savespots/tokens and @savespots/shared, and resolve deps from both
// the app's and the root's node_modules. Wrapped with NativeWind.
//
// `expo-doctor` flags the two overrides below and advises reverting to Expo's
// defaults. DO NOT. This workspace legitimately holds two React majors: apps/web
// is Next 14 (React 18, hoisted to the workspace root) and this app is Expo 54 /
// RN 0.81 (React 19, in apps/mobile/node_modules). Listing projectRoot first and
// disabling hierarchical lookup is what pins the app to React 19 — without it
// Metro walks up and binds React 18, and the native build breaks. Deduplicating
// to satisfy the doctor would break one of the two apps.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, { input: "./global.css" });
