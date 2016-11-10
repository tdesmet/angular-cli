import * as path from 'path';
import * as webpack from 'webpack';
import {findLazyModules} from './find-lazy-modules';
import {AotPlugin} from '@ngtools/webpack';

const atl = require('awesome-typescript-loader');

const g: any = global;
const webpackLoader: string = g['angularCliIsLocal']
  ? g.angularCliPackages['@ngtools/webpack'].main
  : '@ngtools/webpack';


export const getWebpackNonAotConfigPartial = function(projectRoot: string, appConfig: any) {
  const appRoot = path.resolve(projectRoot, appConfig.root);
  const lazyModules = findLazyModules(appRoot);

  return {
    resolve: {
      plugins: [
        new atl.TsConfigPathsPlugin({
          tsconfig: path.resolve(appRoot, appConfig.tsconfig)
        })
      ]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loaders: [{
            loader: 'awesome-typescript-loader',
            query: {
              forkChecker: true,
              tsconfig: path.resolve(appRoot, appConfig.tsconfig)
            }
          }, {
            loader: 'angular2-template-loader'
          }],
          exclude: [/\.(spec|e2e)\.ts$/]
        }
      ],
    },
    plugins: [
      new webpack.ContextReplacementPlugin(/.*/, appRoot, lazyModules),
      new atl.ForkCheckerPlugin(),
    ]
  };
};

export const getWebpackAotConfigPartial = function(projectRoot: string, appConfig: any,
  i18nFile: string, i18nFormat: string, locale: string) {
  return {
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: webpackLoader,
          exclude: [/\.(spec|e2e)\.ts$/]
        }
      ]
    },
    plugins: [
      new AotPlugin({
        tsConfigPath: path.resolve(projectRoot, appConfig.root, appConfig.tsconfig),
        mainPath: path.join(projectRoot, appConfig.root, appConfig.main),
        i18nFile: i18nFile,
        i18nFormat: i18nFormat,
        locale: locale
      }),
    ]
  };
};
