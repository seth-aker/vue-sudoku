module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    // No manual reanimated/worklets plugin: babel-preset-expo handles it
    // automatically in Expo SDK 53+ (it injects react-native-worklets/plugin
    // when reanimated is present in the dependency tree).
  }
}
