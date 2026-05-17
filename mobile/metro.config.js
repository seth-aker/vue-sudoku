// Default Expo Metro config. Override here if/when we need it (custom resolvers,
// extra asset extensions for bundling README.md, etc.).
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

module.exports = config
