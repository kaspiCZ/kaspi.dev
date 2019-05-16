module.exports = function(eleventyConfig) {
  eleventyConfig.addHandlebarsHelper('concat', function() {
    return Array.prototype.slice.call(arguments, 0, -1).reduce((result, argument) => `${result}${argument}`);
  });
};
