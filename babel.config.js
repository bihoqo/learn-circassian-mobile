module.exports = function (api) {
  api.cache(true);
  return {
    // reanimated: false → tells babel-preset-expo not to auto-load
    // react-native-reanimated/plugin. Reanimated v4 requires a separate
    // react-native-worklets package for its plugin, which we don't need
    // because we don't use any animated features in this app.
    presets: [["babel-preset-expo", { reanimated: false }]],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
          },
        },
      ],
    ],
  };
};
