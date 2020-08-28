[![Netlify Status](https://api.netlify.com/api/v1/badges/b216e973-8cdc-4962-abcc-3cfd3b5b5075/deploy-status)](https://app.netlify.com/sites/condescending-northcutt-368998/deploys)

# Personal website with 11ty with bells and whistles

## Based on Eleventy Netlify Boilerplate

This personal website was able to take off thanks to the work of Dan Urbanowicz and his [Eleventy Netlify Bolilerplate](https://github.com/danurbanowicz/eleventy-netlify-boilerplate)

## Additions to Eleventy Netlify Boilerplate

* using [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)
* using [Gulp](https://gulpjs.com/) for processing CSS and JS
* rewritten from [Nunjucks](https://mozilla.github.io/nunjucks/) to [Handlebars](https://handlebarsjs.com/) templates
* using script tags before </body>

## Fair use

Feel free to use this as you see fit. Get a fast experiment running, make your site based off this, improve and iterate. Remember to credit Dan Urbanowicz and do not remove the LICENSE

## Local development

### 1. Clone this repository:

```
git clone https://github.com/kaspiCZ/kaspi.io.git my-blog-name
```


### 2. Navigate to the directory

```
cd my-blog-name
```

Specifically have a look at `.eleventy.js` to see if you want to configure any Eleventy options differently.

### 3. Install dependencies

```
yarn install
```

### 4. Edit _data/metadata.json

This file contains your site title and author details.

### 5. Run (run gulp with watch and 11ty server)

```
yarn serve
```

## Bug reports, feature requests, etc

This is an ongoing project and I welcome contributions. Feel free to submit a PR.

If you need any help with setting up Netlify CMS, you can reach out to the Netlify team in the [Netlify CMS Gitter](https://gitter.im/netlify/netlifycms).
