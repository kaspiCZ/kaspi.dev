const { DateTime } = require('luxon');

module.exports = eleventyConfig => {
  eleventyConfig.addFilter('readableDate', dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat('dd LLL yyyy');
  });
};
