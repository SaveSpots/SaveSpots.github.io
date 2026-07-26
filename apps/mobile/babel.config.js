module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      // nativewind/babel pulls in react-native-css-interop's preset, which
      // already appends react-native-worklets/plugin (Reanimated 4's worklet
      // transform). Do not add a worklet/reanimated plugin here too — it must
      // run exactly once, and last.
      "nativewind/babel",
    ],
  };
};
