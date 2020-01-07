---
title: Wrangling "missing" errors in ember-intl
summary: Ember intl is amazing, but can be painful when your localization is a WIP. We had to resolve build-time errors with empty YAML files.
date: 2020-01-07
featured: true
tags:
  - emberjs
  - nodejs
  - localization
  - ember-intl
---

In the [current article](/posts/lovable-ember-blueprints-for-code-generation/) about localization, I forgot to disclose and explain something that we came across. It warrants a shorter separate post and an edit to the referenced article.

[ember-intl](https://github.com/ember-intl/ember-intl) with its config helps you prevent any omissions in translations. In other words, it checks if your translation keys are present in all of your translations. If not, the behaviour can vary depending on how you configure your instance. The most harsh way of notifying you may be a build error that will fail the build entirely.

You can of course choose to continue with the build despite the errors. The last option would be to provide a function that can handle more complicated cases. Which is what we opted for. The reasoning behind that is related to the way we are handling translating files from one language to another. For the time being, we can say that while we develop, we do so in `cs-test` and copy the contents to `cs-cz`. These then have to be translated to `en-gb` or `es-es`.

The tool we are using for that in our proof of concept works better if the target files are empty. Which was a source of headaches, because the build process was suddenly full of errors due to `js-yaml` (an `ember-intl` dependency) failing when trying to [parse an empty file](https://github.com/ember-intl/ember-intl/blob/6c39c8c15750d345a85cef6766fac3707a51a0e3/lib/broccoli/translation-reducer/index.js#L39).

The solution for that was non-empty target files, providing at least component "namespace":

```yaml
# translations/components/footer/en-gb.yaml
FooterComponent:
```

Yaml can now be parsed and `ember-intl` doesn't throw hard errors. The translation tool is fine too. The only remaining problem is warnings for missing translations.

```yaml
# translations/components/footer/cs-cz.yaml
FooterComponent:
  links:
    borrower: Chci si půjčit

# translations/components/footer/en-gb.yaml
FooterComponent:
```

The above would produce a warning: `[ember-intl] "FooterComponent.links.borrower" was not found in "en-gb"`. The developers are not translating or copy pasting these files. It's the job of the translation team. So we can update our intl config and avoid these errors by providing a custom function:

```js
// config/ember-intl.js
'use strict';

module.exports = function(environment) {
  const config = require('./environment')(environment);
  const { locale: defaultLocale } = config;

  return {
    /**
     * other config
     */
    requiresTranslation(key, locale) {
      // Translations are required for tests and main locale
      return ['cs-test'].concat(defaultLocale).indexOf(locale) >= 0;
    },
  };
};
```

The build output now has only relevant information about translations that our devs really forgot to add.