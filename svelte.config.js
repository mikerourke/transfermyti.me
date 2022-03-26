"use strict";

const sveltePreprocess = require("svelte-preprocess");

const isDevelopment = /development|test/gi.test(process.env.NODE_ENV);

module.exports = {
  preprocess: sveltePreprocess({
    sourceMap: isDevelopment,
  }),

  // Enable run-time checks when not in production:
  dev: isDevelopment,

  // We'll extract any component CSS out into a separate file (better for performance):
  css: (css) => {
    css.write("bundle.css");
  },

  extensions: [".svelte"],
};
