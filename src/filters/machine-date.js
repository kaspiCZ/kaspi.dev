const { DateTime } = require('luxon');

module.exports = eleventyConfig => {
  eleventyConfig.addFilter('machineDate', dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat('yyyy-MM-dd');
  });
};
