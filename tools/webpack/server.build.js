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
  devtool: 'source-map',

  module: {
    rules: [{
        test: /\.js$/i,
        use: ['babel-loader'],
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
            name: '[name]-[hash:8].[ext]',
            emitFile: false
          }
        }]
      },
      {
        test: /\.(webp|mp4|webm|wav|mp3|m4a|aac|oga)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name]-[hash:8].[ext]',
            emitFile: false
          }
        }]
      },
      {
        test: /\.(woff2?|ttf|eot|svg)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name]-[hash:8].[ext]',
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
    /^\.\/assets.json$/,
    (context, request, callback) => {
      const isExternal =
        //the module name start with ('@' or 'a-z') character and contains 'a-z' or '/' or '.' or '-' or '0-9'
        request.match(/^[@a-z][a-z/.\-0-9]*$/i) && !request.match(/\.(css|less|scss)$/i)
      //environment config file, auto generated during build

      callback(null, Boolean(isExternal))
    }
  ],

  plugins: [
    new webpack.DefinePlugin({
      '__BROWSER__': false,
      '__DEV__': false
    }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),

    new webpack.BannerPlugin({
      banner: "require('source-map-support').install();process.env.NODE_ENV='production';",
      raw: true,
      entryOnly: true
    }),

    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),

    new MarkoServerBundlePatcherPlugin(),

    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      comments: false,
      compress: {
        warnings: false
      },
      /*mangle: false*/
    })
  ]
})
