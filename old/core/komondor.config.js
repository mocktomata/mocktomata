module.exports = {
  plugins: [
    'komondor-plugin-fixture-deep-link',
    'komondor-plugin-fixture-dummy',
    'komondor-plugin-fixture-no-activate'
  ],
  bundle: {
    output: 'out/komondor-plugins.js'
  }
}
