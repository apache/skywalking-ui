const path = require('path');

const config = {
  entry: 'src/index.js',
  extraBabelPlugins: [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
  },
  alias: {
    components: path.resolve(__dirname, 'src/components/'),
  },
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs',
  },
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableDynamicImport: false,
  publicPath: '/',
  hash: true,
};

if (process.env.NO_MOCK) {
  config.proxy = {
    '/api': {
      target: 'http://localhost:12800',
      changeOrigin: true,
      pathRewrite: path => {
        console.log(path);
        return '/graphql';
      },
    },
  };
}

export default config;
