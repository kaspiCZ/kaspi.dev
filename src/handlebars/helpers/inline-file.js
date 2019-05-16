const fs = require('fs');

module.exports = function(eleventyConfig, projectRoot) {
  eleventyConfig.addHandlebarsHelper('inline-file', function(file) {
    return fs.readFileSync(`${projectRoot}${file}`, { encoding: 'utf8'});
  });
};
