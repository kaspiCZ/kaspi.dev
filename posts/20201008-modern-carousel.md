---
title: Video carousel, the modern way
summary: A combination of modern CSS and JavaScript for a carousel
date: 2020-10-08
featured: true
tags:
  - css
  - svg
  - javascript
---

Our UX wants to use a carousel to display videos on [frontpage](https://zonky.cz/). You will see either the old one, or my new one, depending on when you look. The old one works, but the markup, CSS and JavaScript are dated. I was confident that the same result can be achieved more elegantly.

**The result first:** [https://codepen.io/kaspi_cz/pen/abNwWeV](https://codepen.io/kaspi_cz/pen/abNwWeV)

and how to get there:

# The idea

Using flex for item sizing and alignment, and transforms for positioning. Then using an SVG filter for blur effect on inactive items.

Right after the first step came together, I had a look at [twitch.tv](https://www.twitch.tv)'s frontpage, I quickly realized I was not the first with this idea. Though their approach is a bit different. They are going off a fixed height and absolute positioning with rigid transforms.

# Steps

## Markup and alignment

Looking at the vision of our UX, the middle item takes up about half of the container, while the sides take up about a third each. Aligning these side-by-side can be done with flexbox.

```html
<div class="tv">
  <div data-order="0">1</div>
  <div data-order="1">2</div>
  <div data-order="2">3</div>
</div>
```

```css
.tv {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.tv > div {
  flex-basis: calc(1/3 * 100%);
  width: calc(1/3 * 100%);
}

.tv > div[data-order="1"] {
  flex-basis: 50%;
  width: 50%;
}
```

The result would fit the container and be smaller than expected, because (you guessed it) the default for a flex item is `flex-grow: 0` and `flex-shrink: 1`. We want all items to have a precise size. If we disable shrink and grow, our content overflows, because (you guessed it again) the total base width of all three items is more than 100 %. But we will do that to achieve the sizes we want. Then we will hide the overflow too.

```css
.tv {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100%;
}

.tv > div {
  flex: 0 0 calc(1/3 * 100%);
  width: calc(1/3 * 100%);
}

.tv > div[data-order="1"] {
  flex-basis: 50%;
  width: 50%;
}
```

On large screens, we want to slip the smaller items partially below the central one. Turns out `position: absolute` works like a charm with flexbox. It does exactly what we need. The last bit is adding transforms.

```css
.tv {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100%;
}

.tv > div {
  position: absolute;
  flex: 0 0 calc(1/3 * 100%);
  width: calc(1/3 * 100%);
  transition: transform 200ms;
}

.tv > div[data-order="1"] {
  position: relative;
  z-index: 10;
  flex-basis: 50%;
  width: 50%;
}

.tv > div[data-order="0"] {
  transform: translateX(-100%);
}

.tv > div[data-order="2"] {
  transform: translateX(100%);
}
```

## Responsivity

On smaller screen sizes, we would set the items to full width. We would keep the transforms too, because it will help achieve the effect of items sliding from left or right into the view. There is no need to change the JavaScript either due to the reliance on data attribute updates.

## Handling (JavaScript)

Everything is now set up via the markup and CSS, so the JavaScript has to take care of 2 things:

**First one is**: moving the items. It needs to update the order numbers in data attributes. Moving to either side can be achieved by incrementing or decrementing all `data-order` attributes and moving the one that overflows to the other side.

> 0, 1, 2
becomes
1, 2, 3

where the 3 is "overflowing" and so it needs to become a 0. That way the item from the right transitions to the left thanks to CSS transitions.

**Second one**: the less obvious task for JavaScript came when I implemented the first one. As soon as all transforms start happening simulteneously, they happen to shrink in width and therefore also height at one moment. The container shrinks with them. Here's where Twitch's approach had an upper hand. But we can have the cake and eat it too, if we set the height up initially and recompute it when the wrapper gets resized. Which is where [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) comes into play.

Please look at the [CodePen pen](https://codepen.io/kaspi_cz/pen/abNwWeV) for the actual JavaScript code. You can see the usage of ResizeObserver and since this is a video carousel, there is code to stop YouTube playback on rotation.

## Bonus: SVG filter

```html
<svg xmlns="https://www.w3.org/2000/svg" version="1.1" height="0">
  <filter id="blur" width="110%" height="110%">
    <feGaussianBlur stdDeviation="2" result="blur" />
  </filter>
</svg>
```

```css
.tv > div[data-order="0"] {
  transform: translateX(-100%);
  filter: url("#blur");
}

.tv > div[data-order="2"] {
  transform: translateX(100%);
  filter: url("#blur");
}
```

## Bonus: adding the videos

As I mentioned multiple times, it is a video carousel, so the next steps would be adding the videos into the elements. Paul Irish's [Lite Youtube](https://github.com/paulirish/lite-youtube-embed) is an amazing tool for that. I did not want to use custom HTML elements yet, so I ended up rewriting his code to bind to a class, but the result is still the same: it preloads what you need and only when you want to play a video, it initializes a player. You save about 1.5 MB worth of download for each video embed.

Also recommended: disabling pointer events on the side items (as seen in the pen).

## Quirk

There is one thing you cannot normally see, but once you do, you cannot unsee it. When the last item moves from end to start, it slides over the first item. It does so, because it has the same `z-index`, but comes later in the DOM. We could assign `z-index` to all of the elements and have `z-20`, `z-30`, `z-10`. That would not work when moving the other way though. So depending on the direction, we would need to assign `z-20` to the left or right item.
