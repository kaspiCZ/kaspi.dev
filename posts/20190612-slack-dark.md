---
title: Join the dark side of Slack
summary: With a little bit of crafting, we too can have nice things for our desktop Slack - a darkmode
date: 2019-06-12
tags:
  - slack
  - hack
  - bash
---
Note: we're talking Linux (Ubuntu) in this post.

I've noticed Slack added a dark mode to the mobile version of their app. While we still don't have that available for desktop, searching the internet yielded the expected: there is a way for us.

There's an abandoned repository, but a fork exists: https://github.com/Nockiro/slack-black-theme

The readme discusses adding a code snippet which in turn pulls custom css from this repository. Should I tell you that linking random files from the internet is bad? You know that, right? **Fork the repository and link to your own copy!**

As noted in the repository, every update to your desktop Slack will override the changes you made, so why not semi-automate the process? Who am I to say no to a little bit of bash scripting (emphasis on the "little").

I've copied the snippet from the readme and put it in my home directory as `slack-dark`. Then created a script next to it:

```bash
#!/bin/bash

cat /home/kaspi/bin/slack-dark >> /usr/lib/slack/resources/app.asar.unpacked/src/static/index.js
cat /home/kaspi/bin/slack-dark >> /usr/lib/slack/resources/app.asar.unpacked/src/static/ssb-interop.js
```

Next step? Pulling an offline version of the `custom.css` and finding a good way to wedge it into the desktop application after it is initialized.
