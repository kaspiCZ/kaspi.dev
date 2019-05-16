module.exports = function(eleventyConfig) {
  eleventyConfig.addHandlebarsHelper('reverse', function(collection) {
    return collection.reverse();
  });
};
