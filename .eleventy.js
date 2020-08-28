const htmlmin = require('html-minifier');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const safeExternalLinks = require('@hirusi/eleventy-plugin-safe-external-links');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

const hbsAbsoluteUrl = require('./src/handlebars/helpers/absolute-url');
const hbsConcat = require('./src/handlebars/helpers/concat');
const hbsFirstObject = require('./src/handlebars/helpers/first-object');
const hbsGet = require('./src/handlebars/helpers/get');
const hbsHtmlAbsoluteUrls = require('./src/handlebars/helpers/html-to-absolute-urls');
const hbsInlineFile = require('./src/handlebars/helpers/inline-file');
const hbsReverse = require('./src/handlebars/helpers/reverse');
const hbsTruthHelpers = require('./src/handlebars/helpers/truth-helpers');

const formatDate = require('./src/filters/format-date');
const machineDate = require('./src/filters/machine-date');
const readableDate = require('./src/filters/readable-date');

function addFilters(eleventyConfig) {
  formatDate(eleventyConfig);
  machineDate(eleventyConfig);
  readableDate(eleventyConfig);

  hbsAbsoluteUrl(eleventyConfig);
  hbsConcat(eleventyConfig);
  hbsFirstObject(eleventyConfig);
  hbsGet(eleventyConfig);
  hbsHtmlAbsoluteUrls(eleventyConfig);
  hbsInlineFile(eleventyConfig, __dirname);
  hbsReverse(eleventyConfig);
  hbsTruthHelpers(eleventyConfig);
}

function isPost(collectionItem) {
  return (
    collectionItem.inputPath &&
    collectionItem.inputPath.match(/^\.\/posts\//) !== null
  );
}

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPlugin(safeExternalLinks, {
    noreferrer: true,
  });

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
  eleventyConfig.addCollection('posts', (collection) => {
    return collection.getAllSorted().filter((item) => {
      return isPost(item);
    });
  });

  // non-featured posts first
  eleventyConfig.addCollection('nonFeaturedPosts', (collection) => {
    return collection
      .getAllSorted()
      .filter((item) => isPost(item))
      .filter((item) => !item.data || !item.data.featured);
  });

  // only featured posts
  eleventyConfig.addCollection('featuredPosts', (collection) => {
    return collection.getAllSorted().filter((item) => {
      return isPost(item) && item.data && item.data.featured;
    });
  });

  // featured posts first
  eleventyConfig.addCollection('featuredPostsFirst', (collection) => {
    return collection
      .getAllSorted()
      .filter((item) => isPost(item))
      .sort((a, b) => (!a.data.featured && b.data.featured ? 1 : 0));
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy('static/img');
  eleventyConfig.addPassthroughCopy('admin');
  eleventyConfig.addPassthroughCopy('_includes/assets/');

  // Watch source SASS and JS files
  eleventyConfig.addWatchTarget('./src/js/');
  eleventyConfig.addWatchTarget('./src/scss/');

  /* Markdown Plugins */
  eleventyConfig.setLibrary(
    'md',
    markdownIt({
      html: true,
      breaks: true,
      linkify: true,
    }).use(markdownItAnchor, {
      permalink: false,
    }),
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
