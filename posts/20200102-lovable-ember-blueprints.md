---
title: Lovable ember blueprints for code generation (edited)
summary: Ember code generators are an amazing way to save time and ensure everyone is on the same page. They're flexible too.
date: 2020-01-02
featured: true
tags:
  - emberjs
  - nodejs
  - localization
  - ember-intl
---
**Big thank you goes to [Jan Bobisud](https://github.com/bobisjan)! Who got me on the right track with this.taskFor('generate-from-blueprint').run() and [Pavol Daňo](https://twitter.com/PuwelOne) for proofreading and suggestions on this post.**

## How are things mid migration to Ember Octane?

At [Zonky](https://zonky.cz)/[Benxy](https://benxy.eu) we are currently tackling localization of our Ember application as part of our planned expansion to other EU countries. This comes with the usual setting up of locale as well as with preparing translations.

There will be more about that later and probably a pretty comprehensive write up of all the steps we went through once we have a better understanding and get closer to a solution we are going to stick with.

Part of the problem is keeping the team up to date, while ensuring we deliver what is needed for the translation flow to work. We have tried to keep an eye out and have each other's back in pull requests

> You are missing the en-gb.yaml file here ^

but that does not scale, is error prone, and adds a lot of unnecessary overhead.

We already use `ember generate` a lot, but our current state of migration to [Ember Octane](https://emberjs.com/editions/octane/) does not allow us to fully use the [Ember CLI](https://github.com/ember-cli/ember-cli/) [blueprints](https://github.com/emberjs/ember.js/tree/v3.12.2/blueprints/component) the way they are intended, because we would have to remember to always [set an ENV var](https://github.com/emberjs/ember.js/blob/v3.12.2/blueprints/edition-detector.js) before running the generator:

```bash
EMBER_VERSION='OCTANE' npx ember g component footer
```

## What do we need from a component?

So we have decided to use the new bits from Octane and add some customizations. For example when creating a component, we want to use the [class syntax introduced in ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), but our components are not yet [glimmer](https://github.com/glimmerjs) components. Hence our custom blueprint is a hybrid importing the Ember component instead of a Glimmer one:

```js
// app/components/footer-component/component.js
import Component from '@ember/component';
// the import in Octane would have been:
// import Component from '@glimmer/component';

export default class FooterComponent extends Component {}
```

So we get new class syntax for a Component and we get a component test. Neat. But we are using [Ember CLI Page Object](http://ember-cli-page-object.js.org/docs/v1.16.x/) in our tests too and on top of that, using [pods](https://www.programwitherik.com/ember-pods/) means dealing with specific directory structure. Every component also needs a file with translations. At least I usually end up making those by hand. In the end a whole component consists of the following tree:

```html
/
├── app
│   └── components
│       └── footer
│           ├── component.js
│           └── template.hbs
├── tests
│   ├── integration
│   │   └── components
│   │       └── footer
│   │           └── component-test.js
│   └── pages
│       └── components
│           └── footer.js
└── translations
    └── components
        └── footer
            └── cs-cz.yaml
```

## Improving current state with custom blueprints

One can update the blueprint files, but the power is in the customization options in their hooks. Generating `component-test` with a component is already included and handled in Ember CLI, but chaining the Page Object and translations is something we needed to do ourselves.

```js
// blueprints/component/index.js
'use strict';

const component = require('ember-source/blueprints/component');
const { activeLocales } = require('../../config/environment')('development');

/**
 * Specify all locales to include in translation flow
 * @type {string[]}
 */
const locales = ['cs-test'].concat(activeLocales);

/**
 * Specify all locales for which to generate empty translation files
 * @type {string[]}
 */
const empty = ['en-gb', 'es-es'];

component.afterInstall = async function(options) {
  for (const locale of locales) {
    await this.taskFor('generate-from-blueprint').run({
      args: ['component-translation', locale],
      component: options.entity.name,
      createEmpty: empty.includes(locale),
    });
  }

  await this.taskFor('generate-from-blueprint').run({
    args: ['page-object-component', options.entity.name],
  });
};

module.exports = component;
```

Note: `cs-test` is a special locale version based off cs-cz which we use in integration/acceptance tests where we want to check that the correct texts are displayed.

Edit: we are now not generating empty files, because that caused a lot of problems with `ember-intl` at build time. These are explained in detail in [Ember Intl wrangling](/ember-intl-wrangling), but the final blueprint is missing the `empty` constant.

Using the `afterInstall` hook from the CLI API, we were able run some other generator commands. Having looked at `component-translation`, running it suggests specifying a locale, but nothing beyond that. It is possible to pass arguments and options to the command though. By doing that, our custom version of translation blueprint can utilize them:

```js
// blueprints/component-translation/index.js
'use strict';
const translation = require('ember-intl/blueprints/translation');
const { classify } = require('ember-cli-string-utils');

translation.fileMapTokens = function(options) {
  if (options.locals.componentPathName) {
    return {
      __path__(options) {
        return options.locals.componentPathName;
      },
      __name__(options) {
        return options.dasherizedModuleName;
      },
    };
  }

  throw new Error('Must provide a component name after locale');
};

translation.locals = function(options) {
  const locals = {
    translationNamespace: '',
    componentPathName: options.taskOptions.component,
  };

  if (options.taskOptions.component && !options.taskOptions.createEmpty) {
    const namespace = options.taskOptions.component
      .split('/')
      .map(classify)
      .join('::');

    locals.translationNamespace = `${namespace}:`;
  }

  return locals;
};

module.exports = translation;
```

Edit: as mentioned above, we have since removed the check for `!options.taskOptions.createEmpty`, because we are now not generating empty files at all.

`locals` get resolved first before they are [merged and passed](https://github.com/ember-cli/ember-cli/blob/master/lib/models/blueprint.js) to `fileMapTokens`, which can utilize them in a structure like this one:

```html
/
└── blueprints
    └── component-translation
        └── files
            └── translations
                └── components
                    └── __path__
                        └── __name__.yaml
```

```yaml
# __name__.yaml
<%= translationNamespace %>
```

## Conslusion

By updating our blueprints with newer syntax and chaining generators, we are now able to provide a comfortable experience to our devs and avoid cognitive overload. Nobody should underestimate that!

Next up is creating a pre-commit hook to avoid missing translation files in case someone did not use a generator :)