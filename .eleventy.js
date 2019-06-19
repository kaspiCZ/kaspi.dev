const htmlmin = require('html-minifier');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

const hbsConcat = require('./src/handlebars/helpers/concat');
const hbsGet = require('./src/handlebars/helpers/get');
const hbsInlineFile = require('./src/handlebars/helpers/inline-file');
const hbsReverse = require('./src/handlebars/helpers/reverse');
const hbsTruthHelpers = require('./src/handlebars/helpers/truth-helpers');

const machineDate = require('./src/filters/machine-date');
const readableDate = require('./src/filters/readable-date');

function addFilters(eleventyConfig) {
  machineDate(eleventyConfig);
  readableDate(eleventyConfig);

  hbsConcat(eleventyConfig);
  hbsGet(eleventyConfig);
  hbsInlineFile(eleventyConfig, __dirname);
  hbsReverse(eleventyConfig);
  hbsTruthHelpers(eleventyConfig);
}

module.exports = eleventyConfig => {
  eleventyConfig.addLayoutAlias('post', 'layouts/post.hbs');

  addFilters(eleventyConfig);

  // Minify HTML output
  eleventyConfig.addTransform('htmlmin', (content, outputPath) => {
    if (outputPath.indexOf('.html') > -1) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
    }
    return content;
  });

  // only content in the `posts/` directory
  eleventyConfig.addCollection('posts', collection => {
    return collection.getAllSorted().filter(item => {
      return item.inputPath.match(/^\.\/posts\//) !== null;
    });
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy('static/img');
  eleventyConfig.addPassthroughCopy('admin');
  eleventyConfig.addPassthroughCopy('_includes/assets/');

  /* Markdown Plugins */
  const options = {
    html: true,
    breaks: true,
    linkify: true,
  };
  const opts = {
    permalink: false,
  };

  eleventyConfig.setLibrary(
    'md',
    markdownIt(options).use(markdownItAnchor, opts),
  );

  return {
    templateFormats: ['hbs', 'md', 'njk', 'html', 'liquid'],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: '/',

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'hbs',
    dataTemplateEngine: 'hbs',
    passthroughFileCopy: true,
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  };
};
