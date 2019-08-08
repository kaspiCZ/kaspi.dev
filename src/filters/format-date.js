const { DateTime } = require('luxon');

module.exports = eleventyConfig => {
  eleventyConfig.addFilter('format-date', (dateObj, format) => {
    return DateTime.fromJSDate(dateObj).toFormat(format);
  });
};
