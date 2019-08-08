const fs = require('fs');

module.exports = (eleventyConfig, projectRoot) => {
  eleventyConfig.addHandlebarsHelper('inline-file', file => {
    return fs.readFileSync(`${projectRoot}${file}`, { encoding: 'utf8' });
  });
};
