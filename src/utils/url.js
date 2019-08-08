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
