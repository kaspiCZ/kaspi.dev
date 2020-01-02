module.exports = eleventyConfig => {
  eleventyConfig.addHandlebarsHelper('if', (conditional, ...options) => {
    if (typeof options[0] === 'string') {
      if (typeof options[1] === 'string') {
        return conditional ? options[0] : options[1];
      }

      if (conditional) {
        return options[0];
      }

      return '';
    }

    if (conditional) {
      return options[0].fn(this);
    }

    return options[0].inverse(this);
  });
};
