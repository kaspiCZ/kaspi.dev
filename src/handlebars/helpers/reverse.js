module.exports = eleventyConfig => {
  eleventyConfig.addHandlebarsHelper('reverse', collection => {
    if (!Array.isArray(collection)) {
      return collection;
    }

    return [...collection].reverse();
  });
};
