const helpers = {
  eq: function(a, b) {
    return a === b;
  },
  ne: function(a, b) {
    return a !== b;
  },
  lt: function(a, b) {
    return a < b;
  },
  lte: function(a, b) {
    return a <= b;
  },
  gt: function(a, b) {
    return a > b;
  },
  gte: function(a, b) {
    return a >= b;
  },
  and: function() {
    return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
  },
  or: function() {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  }
};

module.exports = function(eleventyConfig) {
  for (let helper in helpers) {
    eleventyConfig.addHandlebarsHelper(helper, helpers[helper]);
  }
};
