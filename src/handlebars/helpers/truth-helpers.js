const helpers = {
  eq(a, b) {
    return a === b;
  },
  'not-eq': function(a, b) {
    return a !== b;
  },
  lt(a, b) {
    return a < b;
  },
  lte(a, b) {
    return a <= b;
  },
  gt(a, b) {
    return a > b;
  },
  gte(a, b) {
    return a >= b;
  },
  and(...args) {
    return Array.prototype.slice.call(args, 0, -1).every(Boolean);
  },
  or(...args) {
    return Array.prototype.slice.call(args, 0, -1).some(Boolean);
  },
};

module.exports = eleventyConfig => {
  Object.keys(helpers).forEach(helper =>
    eleventyConfig.addHandlebarsHelper(helper, helpers[helper]),
  );
};
