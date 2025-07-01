const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // This is crucial for local development without Docker-Compose reverse proxy.
    // When using docker-compose, the VITE_API_URL environment variable will be used.
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3000', // Points to your backend
    //     changeOrigin: true,
    //     pathRewrite: { '^/api': '' },
    //   },
    // },
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': __dirname + '/src',
      },
    },
  },
});