---
title: I overrode 3rd party CSS and I liked it
summary: Background SVG feels like cheating, but the results have certain elegance to them.
date: 2019-06-11
tags:
  - emberjs
  - ember-power-select
  - css
  - scss
  - hack
  - svg
---
Sometimes it's hard to muster up the time to go through the proper channels of proposing a change and creating a pull request against a 3rd party library. Eventually you will want to do it, but we're paid to find solutions and deliver to clients. Not to endlessly wait for merges to update our dependencies before we ship.

[ember-power-select](https://github.com/cibernox/ember-power-select) is our weapon of choice, but our UX team had a different dropdown handle / status icon in mind (you know, the little triangle that indicates it is a dropdown).

We are using [Font Awesome](https://fontawesome.com/v4.7.0/icons/) and there are a few places in our app where the chevron icon is already being used. In all of the cases so far, we have been inlining the icons. Finding a way to put it inside the `<PowerSelect>`, battling alignment and positioning, was rather painful.

For the time being, we can grab the SVG and come up with an SCSS solution which would override the defaults:

```scss
&--theme-default {
  .ember-power-select-status-icon {
    $iconColor: str-slice(#{map-get($color-brand, 'teal')}, 2);

    position: relative;
    margin-left: map-get($paddings, xmedium);
    width: 10px;
    height: 16px;
    vertical-align: middle;
    background: transparent
      url('data:image/svg+xml;utf8,<svg width="10px" height="16px" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg"><path fill="%23#{$iconColor}" d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z"></path></svg>')
      no-repeat;
    border: none;
  }
}
```

## Let's have a closer look
The `.ember-power-select-status-icon` element from [ember-power-select](https://github.com/cibernox/ember-power-select) adds the status icon as a triangle, taking advantage of the proven [CSS triangle](https://css-tricks.com/snippets/css/css-triangle/) technique. 

What I'm doing is utilizing their already present markup, which gets rid of a whole category of problems with horizontal resizing, aligning and padding.

I've set the SVG icon as a background image. Defining the url as data and avoiding base64 encoding, I was able to write the whole SVG icon in a human-readable format. Which is amazing for any demi-god who is able to edit SVGs from memory (not me).

The only downside is _it does not work in IE11_, but I managed to persuade our UX team that we can live with that.

## Technicalities

Hash character in a hex definition of a colour needs to be urlencoded due to how `url data:` is handled. 

> Note: [Zonky](https://zonky.cz) is steadily moving towards a design system, so we've started defining lists of values (tokens will come later). It's a whole different topic, but there will eventually and hopefully be an article titled "How we succeeded by incrementally moving towards a design system".

That was an aside to explain why I'm working with a list of colours. I needed the hex definition of my desired colour without the hash character. This can be easily achieved with `str-slice`. Except it did not work as expected, because the value from `map-get` was not a string. So first, I needed to ensure I had a string `#{map-get($color-brand, 'teal')}`. Good, but now I had `"#ff000"`, including the quotes. And that was why I had to slice away 2 characters `"#`.

To sum it up:
* get an svg icon
* stick it in a background as data:
* set the fill colour
 
There are downsides to this first iteration too. Size of the element is fixed. To be fair to ourselves though, `<PowerSelect>` specifies the CSS triangle in absolute units too.
