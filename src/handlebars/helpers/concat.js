module.exports = eleventyConfig => {
  eleventyConfig.addHandlebarsHelper('concat', (...args) => {
    return Array.prototype.slice
      .call(args, 0, -1)
      .reduce((result, argument) => `${result}${argument}`);
  });
};
