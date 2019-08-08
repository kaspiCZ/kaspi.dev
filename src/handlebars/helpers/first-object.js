module.exports = eleventyConfig => {
  eleventyConfig.addHandlebarsHelper('first-object', collection => {
    return collection[0];
  });
};
