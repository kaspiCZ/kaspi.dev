module.exports = function(eleventyConfig) {
  eleventyConfig.addHandlebarsHelper('get', function(from, object) {
    return object[from];
  });
};
