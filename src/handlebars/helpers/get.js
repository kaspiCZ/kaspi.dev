module.exports = eleventyConfig => {
  eleventyConfig.addHandlebarsHelper('get', (from, object) => {
    return object[from];
  });
};
