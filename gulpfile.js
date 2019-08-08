const autoprefix = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const fancyLog = require('fancy-log');
const { dest, parallel, series, src, watch: gulpWatch } = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const paths = {
  css: {
    source: 'src/scss/',
    target: '_includes/assets/css/',
  },
  js: {
    lib: 'src/lib/',
    source: 'src/js/',
    node: 'node_modules/',
    target: '_includes/assets/js/',
  },
};

function css() {
  return src([`${paths.css.source}/**/*.scss`])
    .pipe(
      sass({
        otputStyle: 'compressed',
        sourceComments: 'map',
        includePaths: ['node_modules/include-media/dist/*'],
      }),
    )
    .on('error', fancyLog)
    .pipe(autoprefix())
    .pipe(dest(paths.css.target))
    .on('error', fancyLog);
}

function jsVendor() {
  return src([
    `${paths.js.node}mdn-polyfills/*.js`,
    `!${paths.js.node}mdn-polyfills/rollup.build.js`,
  ])
    .pipe(concat('vendor.js'))
    .on('error', fancyLog)
    .pipe(dest(paths.js.target))
    .on('error', fancyLog);
}

function jsApp() {
  return src([`${paths.js.source}**/*.js`])
    .pipe(babel())
    .on('error', fancyLog)
    .pipe(dest(paths.js.target))
    .on('error', fancyLog);
}

function minifyCss() {
  return src([
    `${paths.css.target}**/*.css`,
    `!${paths.css.target}**/*.min.css`,
  ])
    .pipe(sourcemaps.init())
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.css.target));
}

function minifyJs() {
  return src([`${paths.js.target}**/*.js`, `!${paths.js.target}**/*.min.js`])
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(replace(/require\(".\/([\d\w_-]+).js"\)/g, 'require("./$1.min.js")'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.js.target));
}

function watch() {
  gulpWatch(`${paths.css.source}**/*.scss`, { interval: 500 }, series(css));
  gulpWatch(`${paths.js.source}**/*.js`, { interval: 500 }, series(jsApp));
  gulpWatch(
    [`${paths.js.lib}**/*.js`, `${paths.js.node}**/*.js`],
    { interval: 500 },
    series(jsVendor),
  );
}

const install = series(css, jsVendor, jsApp);

const defaultTask = series(parallel(css, jsVendor, jsApp), watch);

const build = series(
  parallel(css, jsVendor, jsApp),
  parallel(minifyCss, minifyJs),
);

module.exports = {
  build,
  default: defaultTask,
  install,
  watch,
};
