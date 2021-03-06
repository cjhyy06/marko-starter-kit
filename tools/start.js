/**
 * Created by JP on 2017/3/20.
 */

import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import cp from 'child_process'
import browserSync from 'browser-sync'
import _ from 'lodash'

import {
  format,
  getEnv,
  getPublicPath,
  logger
} from './libs/utils'

import {
  copyPublic
} from './copy'

import run from './run'
import clean from './clean'
import watch from './watch'
import VirtualModulePlugin from './plugins/virtual-module-plugin'
import config from './config'
import devClientConfig from './webpack/client.dev'
import devServerConfig from './webpack/server.dev'
import entrySettings from '../entry-settings'

async function start() {
  let env = getEnv()
  await run(clean)
  await run(copyPublic);

  devClientConfig.output.publicPath = devServerConfig.output.publicPath = getPublicPath('dev')

  await new Promise((resolve) => {

    //load entry setting
    let entryKeys = _.keys(entrySettings)
    let virtualAssets = {}
    let clientEntry = {}

    //prepare config for webpack server and client config
    _.forEach(entryKeys, (key) => {
      let entry = entrySettings[key];
      if (entry.include) {
        virtualAssets[key] = {
          "js": `http://localhost:${config.frontPort}/${key}.js`
        }
        clientEntry[key] = [entry.src, 'webpack-hot-middleware/client?reload=false']
      }
    })

    //attach virtual module plugin to webpack server config
    devServerConfig.plugins.push(
      new VirtualModulePlugin({
        moduleName: 'src/assets.json',
        contents: virtualAssets
      })
    )

    //setup client webpack config's entry
    devClientConfig.entry = clientEntry;

    // init server and client compiler
    const serverCompiler = webpack(devServerConfig)
    const clientCompiler = webpack(devClientConfig)

    const wpDevMiddleware = webpackDevMiddleware(clientCompiler, {
      publicPath: devClientConfig.output.publicPath,
      stats: devClientConfig.stats
    })

    const wpHotMiddleware = webpackHotMiddleware(clientCompiler)

    var bs = null

    let handleServerBundleCompleted = () => {
      startServer()
      bs = browserSync.create()
      bs.init({
        port: config.frontPort,
        proxy: {
          target: `http://localhost:${config.backendPort}`,
          middleware: [wpDevMiddleware, wpHotMiddleware],
          proxyOptions: {
            xfwd: true,
          },
        }
      }, resolve)

      handleServerBundleCompleted = () => {
        startServer()
        bs.reload()
      }
    }

    let server = null

    const onStdOut = (data) => {
      const match = data.toString('utf8').match(/Listening at http:\/\/(.*?)\//)
      process.stdout.write(format(new Date()))
      process.stdout.write(data)

      if (match) {
        server.stdout.removeListener('data', onStdOut)
        server.stdout.on('data', x => process.stdout.write(x))
      }
    }

    const startServer = function() {
      if (server) {
        server.kill('SIGTERM')
      }

      server = cp.spawn('node', [`./${config.dist}/server`], {
        env: Object.assign({
          NODE_ENV: 'development'
        }, process.env),
        silent: false
      })

      server.stdout.on('data', onStdOut);
      server.stderr.on('data', x => process.stderr.write(x))
    }

    serverCompiler.watch({
      aggregateTimeout: 200,
      poll: true
    }, function(err, stats) {
      console.log(stats.toString(devServerConfig.stats))
      handleServerBundleCompleted(stats)
    })

    process.on('exit', () => {
      if (server) {
        server.kill('SIGTERM')
      }
    })
  })
  await run(watch, {
    dest: config.dist
  })
}

export default {
  name: 'start dev server',
  func: start
}
