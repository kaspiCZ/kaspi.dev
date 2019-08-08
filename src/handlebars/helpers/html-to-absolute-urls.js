const { absoluteUrl } = require('../../utils/url');

module.exports = eleventyConfig => {
  eleventyConfig.addHandlebarsHelper(
    'html-to-absolute-urls',
    (htmlContent, base) => {
      if (!base) {
        throw new Error(
          'htmlToAbsoluteUrls(absolutePostUrl) was missing the full URL base.',
        );
      }

      let links = htmlContent.match(/(href|src)="([^"]+)"/g);

      if (!links) {
        return htmlContent;
      }

      let replacedHtmlContent = htmlContent;

      links = [...new Set(links)];

      links.forEach(link => {
        const matchedUrl = link.match(/(href|src)="([^"]+)"/);
        // eslint-disable-next-line no-unused-vars
        const [all, attr, url] = matchedUrl;

        const absolutizedUrl = absoluteUrl(url, base);

        replacedHtmlContent = replacedHtmlContent.replace(
          new RegExp(`${attr}="${url}"`, 'gi'),
          `${attr}="${absolutizedUrl}"`,
        );
      });

      return replacedHtmlContent;
    },
  );
};
