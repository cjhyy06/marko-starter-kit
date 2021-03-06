/**
 * Created by JP on 2017/3/20.
 */

import webpack from 'webpack'
import path from 'path'
import serverSharedConfig from './server.shared'
import MarkoServerBundlePatcherPlugin from '../plugins/marko-server-bundle-patcher-plugin'
import marked from "marked"
const renderer = new marked.Renderer()

export default Object.assign({}, serverSharedConfig, {
  devtool: 'eval-source-map',

  module: {
    rules: [{
        test: /\.(js)$/,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: './.cache/babel-loader'
          }
        }],
        include: [path.join(process.cwd(), 'src')]
      },

      {
        test: /\.marko$/,
        loader: 'marko-loader'
      },

      {
        test: /\.(scss|less|css)$/i,
        use: ['null-loader']
      },

      {
        test: /\.(ico|gif|png|jpg|jpeg)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            emitFile: false
          }
        }]
      },

      {
        test: /\.(webp|mp4|webm|wav|mp3|m4a|aac|oga)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            emitFile: false
          }
        }]
      },

      {
        test: /\.(woff2?|ttf|eot|svg)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            emitFile: false
          }
        }]
      },

      {
        test: /\.md$/,
        use: [{
            loader: "html-loader"
          },
          {
            loader: "markdown-loader",
            options: {
              pedantic: true,
              renderer
            }
          }
        ]
      }
    ]
  },

  externals: [
    (context, request, callback) => {
      const isExternal =
        // the module name start with ('@' or 'a-z') character and contains 'a-z' or '/' or '.' or '-' or '0-9'
        request.match(/^[@a-z][a-z/.\-0-9]*$/i) && !request.match(/\.(css|less|scss)$/i)
      //environment config file, auto generated during build
      //console.log(request + '--------' + Boolean(isExternal))

      callback(null, Boolean(isExternal))
    }
  ],

  plugins: [
    new webpack.DefinePlugin({
      '__BROWSER__': false,
      '__DEV__': true
    }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),

    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install()',
      raw: true,
      entryOnly: false
    }),

    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),

    new MarkoServerBundlePatcherPlugin()
  ]
})
