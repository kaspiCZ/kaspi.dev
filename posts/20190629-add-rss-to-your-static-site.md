---
title: Add RSS to your static site and people will love you
summary: RSS is an often overlooked feature. Unleash its power to allow your readers to have a great time and never miss a post.
date: 2019-06-29
featured: true
tags:
  - static-site
  - rss
  - 11ty
---
## Motivation

I've been reading Sara Soueidan on Twitter talking about RSS and remembered the great days of Google Reader and Feedly, getting a little sad that we now somehow rely on reddit/HN for most of our news syndication. That means my site will have RSS from day one. For Sara, for me, for you.

## Preface

Unless you pick up a ready-made solution, chances are that you will forget about RSS. This content syndication gem is overlooked, but allows readers to follow you real-time and do all sorts of crazy filtering and magic to get what they want from your website.

If you are building a brand new static site, especially based on a nice minimal JAMStack starter, you will either have to pick a solution (e.g. a plugin) that suits you, or you will have to build your feed from scratch.

I ended up doing a bit of both. Seeing the amazing [11ty RSS plugin](https://github.com/11ty/eleventy-plugin-rss) from Zach Leatherman, who is also the author of [11ty](https://11ty.io), I immediately jumped in. Oh no, he's using the default [Nunjucks](https://mozilla.github.io/nunjucks/) templates, while I have transformed my site into [Handlebars](https://handlebarsjs.com/).

Going through all that the plugin provides, I had some options. Either forking the repository to transform the code to filters and Handlebars helpers where needed, with the option to later create a pull request; or throwing it all away to implement the bare minimum I needed.

## Building blocks - getting ready to create an Atom XML

### Date formatting

Dates need to pass the [RFC-3339 date-time](https://validator.w3.org/feed/docs/error/InvalidRFC3339Date.html) for [Atom validation](https://validator.w3.org/feed/), so that's one filter:
```js
const { DateTime } = require('luxon');

module.exports = eleventyConfig => {
  eleventyConfig.addFilter('format-date', (dateObj, format) => {
    return DateTime.fromJSDate(dateObj).toFormat(format);
  });
};
```
### Absolute URLs

What I saw from Zach's implementation, I would need to be able to transform relative URLs to absolute:
```js
// src/utils/url.js
const { URL } = require('url');

function absoluteUrl(url, base) {
  try {
    return new URL(url, base).toString();
  } catch (e) {
    return url;
  }
}

module.exports = {
  absoluteUrl,
};
```

```js
// src/handlebars/helpers/absolute-url.js
const { absoluteUrl } = require('../../utils/url');

module.exports = eleventyConfig => {
  eleventyConfig.addHandlebarsHelper('absolute-url', (url, base) =>
    absoluteUrl(url, base),
  );
};
```
Does not look too complicated, but there's more needed - replacing site's relative URLs in the content of an article for absolute ones. Zach's plugin is really robust and uses [posthtml](https://github.com/posthtml/posthtml) and [posthtml-urls](https://github.com/posthtml/posthtml-urls) to handle all sorts of elements that refer to URLs. I've decided that for now, the tree parsing and transforming based on tags and attributes is something I can live without for my MVP. If my links, images and videos work, I'm happy for now. Let's do just string replacement then:
```js
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

      // get all the links first
      let links = htmlContent.match(/(href|src)="([^"]+)"/g);

      if (!links) {
        return htmlContent;
      }

      let replacedHtmlContent = htmlContent;

      // get unique links only to avoid going 1 by 1
      links = [...new Set(links)];

      links.forEach(link => {
        // extract the attribute and link to be replaced
        const matchedUrl = link.match(/(href|src)="([^"]+)"/);
        // eslint-disable-next-line no-unused-vars
        const [all, attr, url] = matchedUrl;

        // get the abolute URL for the relative ones
        // URLs that are already absolute will remain untouched
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
```
## Putting the pieces together

This allowed me to build a feed template based of Zach's sample, but now in Handlebars format. I'm reusing as much of what is defined in Dan Urbanowicz's [Eleventy Netlify Boilerplate](https://github.com/danurbanowicz/eleventy-netlify-boilerplate). That leaves only minimal front matter:
```handlebars
---
permalink: feed.xml
---
{% raw %}
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>{{ metadata.title }}</title>
  <subtitle>{{ feed.subtitle }}</subtitle>
  <link href="{{ absolute-url "feed.xml" metadata.url }}" rel="self"/>
  <link href="{{ metadata.url }}"/>
  <updated>{{ format-date (get "date" (first-object collections.posts)) "yyyy-LL-dd'T'HH:mm:ssZZ" }}</updated>
  <id>{{ url metadata.url }}/</id>
  <author>
    <name>{{ metadata.author.name }}</name>
    <email>{{ metadata.author.email }}</email>
  </author>
  {{#each (reverse collections.posts) as |post|}}
  <entry>
    <title>{{ post.data.title }}</title>
    <link href="{{ absolute-url (url post.url) ../metadata.url }}"/>
    <updated>{{ format-date post.date "yyyy-LL-dd'T'HH:mm:ssZZ" }}</updated>
    <id>{{ absolute-url (url post.url) ../metadata.url }}</id>
    <content type="html">{{ html-to-absolute-urls post.templateContent (absolute-url (url post.url) ../metadata.url) }}</content>
  </entry>
  {{/each}}
</feed>
{% endraw %}
```
