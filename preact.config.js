import ServiceWorkerWebpackPlugin from 'serviceworker-webpack-plugin'
import path from 'path'

export default (config, env, helpers) => {
  config.plugins.push(new ServiceWorkerWebpackPlugin({
    entry: path.join(__dirname, 'src/lib/sw.js')
  }))

  if (env.isProd) {
    // Make async work
    let babel = config.module.loaders.find(loader => loader.loader === 'babel-loader').options
    // Blacklist regenerator within env preset
    babel.presets[0][1].exclude.push('transform-async-to-generator')
    // Add fast-async
    babel.plugins.push([require.resolve('fast-async'), { spec: true }])
  }
}
