var gulp        = require('gulp'),
    del         = require('del'),
    util        = require('gulp-util'),
    sass        = require('gulp-sass'),
    prefixer    = require('gulp-autoprefixer'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    rename      = require('gulp-rename'),
    browserSync = require('browser-sync'),
    ghPages     = require('gulp-gh-pages');

var dist = '.';

gulp.task('serve', function() {
  browserSync.init({
    logSnippet: false,
    open: false,
    notify: false
  });
});

gulp.task('styles', function() {
  gulp.src(['src/scss/main.scss'])
    .pipe(sass())
    .on('error', util.log)
    .pipe(prefixer('last 2 versions'))
    .on('error', util.log)
    .pipe(gulp.dest(dist + '/assets/css/'))
    .pipe(browserSync.reload({stream: true}));
});

/*
* Compile handlebars/partials into html
*/
gulp.task('templates', function() {
  gulp.src(['src/*.hbs'])
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({stream: true}));

  gulp.src(['src/partials/*.hbs'])
    .pipe(gulp.dest(dist + '/partials/'))
    .pipe(browserSync.reload({stream: true}));
});

/*
* Bundle all javascript files
*/
gulp.task('scripts', function() {
  gulp.src(['src/js/**/*.js', '!src/js/libs/*.js'])
    .pipe(concat('bundle.js'))
    .on('error', util.log)
    .pipe(uglify())
    .on('error', util.log)
    .pipe(gulp.dest(dist + '/assets/js/'));

  /*
  * Uglify JS libs and move to dist folder
  */
  gulp.src(['src/js/libs/*.js'])
    .pipe(uglify())
    .on('error', util.log)
    .pipe(rename({
      suffix: '.min'
    }))
    .on('error', util.log)
    .pipe(gulp.dest(dist + '/assets/js/libs'));
});

gulp.task('images', function() {
  gulp.src(['src/images/**/*.{jpg,jpeg,svg,png,gif}'])
    .pipe(gulp.dest(dist + '/assets/images'));
});

gulp.task('clean:images', function(a) {
  del([dist + '/assets/images/**/*.{jpg,jpeg,svg,png,gif}'], a);
});

gulp.task('watch', function() {
  gulp.watch('src/scss/**/*.scss', ['styles']);
  gulp.watch('src/js/**/*.js', ['scripts']);
  gulp.watch('src/**/*.hbs', ['templates']);
  gulp.watch('src/images/**/*.{jpg,jpeg,svg,png,gif}', ['clean:images', 'images']);
});

gulp.task('deploy', function() {
  gulp.src(['**/*.hbs', '**/{images,css,js}/*', 'package.json', '!src/**/*', '!node_modules/**/*'])
    .pipe(ghPages({branch: 'release'}));
});

gulp.task('default', ['watch', 'serve', 'images', 'styles', 'scripts', 'templates']);
