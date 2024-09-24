/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    // Ajoutez cette ligne pour définir le feature flag
    devtool: "source-map", // optionnel pour le débogage
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
      }),
    ],
  },
});
/* eslint-enable @typescript-eslint/no-var-requires */
