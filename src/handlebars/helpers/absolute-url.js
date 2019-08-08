const { absoluteUrl } = require('../../utils/url');

module.exports = eleventyConfig => {
  eleventyConfig.addHandlebarsHelper('absolute-url', (url, base) =>
    absoluteUrl(url, base),
  );
};
