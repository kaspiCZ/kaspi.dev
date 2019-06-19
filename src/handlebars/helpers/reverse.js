module.exports = eleventyConfig => {
  eleventyConfig.addHandlebarsHelper('reverse', collection => {
    return collection.reverse();
  });
};
