'use strict';

const gulp        = require('gulp');
const del         = require('del');
const util        = require('gulp-util');
const sass        = require('gulp-sass');
const prefixer    = require('gulp-autoprefixer');
const uglify      = require('gulp-uglify');
const concat      = require('gulp-concat');
const rename      = require('gulp-rename');
const handlebars  = require('gulp-compile-handlebars');
const browserSync = require('browser-sync');
const ghPages     = require('gulp-gh-pages');
const sassGlob    = require('gulp-sass-bulk-import');
const watch       = require('gulp-watch');
const babel       = require('gulp-babel');

var paths = {
  src: { root: 'src' },
  dist: { root: 'dist' },
  init: function() {
    this.src.sass        = `${this.src.root}/scss/main.scss`;
    this.src.js          = `${this.src.root}/scripts/**/*.js`;
    this.src.images      = `${this.src.root}/images/**/*.{jpg,jpeg,svg,png,gif}`;
    this.src.files       = `${this.src.root}/*.{html,txt}`;

    this.dist.css        = `${this.dist.root}/css`;
    this.dist.images     = `${this.dist.root}/images`;
    this.dist.javascript = `${this.dist.root}/js`;

    return this;
  },
}.init();

gulp.task('serve', () => {
  browserSync.init({
    server: paths.dist.root,
    open: false,
    notify: false,

    // Whether to listen on external
    online: false,
  });
});

gulp.task('styles', () => {
  gulp.src([paths.src.sass])
    .pipe(sassGlob())
    .on('error', util.log)
    .pipe(sass({
      includePaths: ['src/scss'],
    }))
    .on('error', util.log)
    .pipe(prefixer('last 2 versions'))
    .on('error', util.log)
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.reload({stream: true}));
});

/*
* Bundle all javascript files
*/
gulp.task('scripts', () => {
  gulp.src(paths.src.js)
    .pipe(babel({
      presets: ['es2015'],
    }))
    .on('error', util.log)
    .pipe(gulp.dest(paths.dist.javascript))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('images', () => {
  gulp.src([paths.src.images])
    .pipe(gulp.dest(paths.dist.images));
});

gulp.task('files', () => {
  gulp.src([paths.src.files])
    .pipe(gulp.dest(paths.dist.root));
});

watch(paths.src.images, () => {
  gulp.start('images');
});

watch(paths.src.files, () => {
  gulp.start('files');
});

watch(paths.src.js, () => {
  gulp.start('scripts');
});

gulp.task('watch', () => {
  gulp.watch('src/scss/**/*.scss', ['styles']);
  gulp.watch(paths.src.js, ['scripts']);
});

gulp.task('deploy', () => {
  return gulp.src([paths.dist.root + '/**/*'])
    .pipe(ghPages());
});

gulp.task('default', ['watch', 'serve', 'images', 'files', 'styles', 'scripts']);
