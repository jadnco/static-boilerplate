var gulp        = require('gulp'),
    del         = require('del'),
    util        = require('gulp-util'),
    sass        = require('gulp-sass'),
    prefixer    = require('gulp-autoprefixer'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    rename      = require('gulp-rename'),
    handlebars  = require('gulp-compile-handlebars'),
    browserSync = require('browser-sync'),
    ghPages     = require('gulp-gh-pages'),
    sassGlob    = require('gulp-sass-bulk-import');

var dist = './dist';

gulp.task('serve', function() {
  browserSync.init({
    server: dist,
    open: false,
    notify: false
  });
});

gulp.task('styles', function() {
  gulp.src(['src/scss/main.scss'])
    .pipe(sassGlob())
    .on('error', util.log)
    .pipe(sass({
      includePaths: ['src/scss']
    }))
    .on('error', util.log)
    .pipe(prefixer('last 2 versions'))
    .on('error', util.log)
    .pipe(gulp.dest(dist + '/css/'))
    .pipe(browserSync.reload({stream: true}));
});

/*
* Compile handlebars/partials into html
*/
gulp.task('templates', function() {
  var opts = {
    ignorePartials: true,
    batch: ['src/partials']
  };

  gulp.src(['src/*.hbs'])
    .pipe(handlebars(null, opts))
    .on('error', util.log)
    .pipe(rename({
      extname: '.html'
    }))
    .on('error', util.log)
    .pipe(gulp.dest(dist))
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
    .pipe(gulp.dest(dist + '/js/'));

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
    .pipe(gulp.dest(dist + '/js/libs'));
});

gulp.task('images', function() {
  gulp.src(['src/images/**/*.{jpg,jpeg,svg,png,gif}'])
    .pipe(gulp.dest(dist + '/images'));
});

gulp.task('clean:images', function(a) {
  del([dist + '/images/**/*.{jpg,jpeg,svg,png,gif}'], a);
});

gulp.task('files', function() {
  gulp.src(['src/*.{html,txt}'])
    .pipe(gulp.dest(dist));
});

gulp.task('clean:files', function(a) {
  del([dist + '/*.{html,txt}'], a);
});

gulp.task('watch', function() {
  gulp.watch('src/scss/**/*.scss', ['styles']);
  gulp.watch('src/js/**/*.js', ['scripts']);
  gulp.watch('src/**/*.hbs', ['templates']);
  gulp.watch('src/*.{html,txt}', ['clean:files', 'files']);
  gulp.watch('src/images/**/*.{jpg,jpeg,svg,png,gif}', ['clean:images', 'images']);
});

gulp.task('deploy', function() {
  return gulp.src([dist + '/**/*'])
    .pipe(ghPages());
});

gulp.task('default', ['watch', 'serve', 'images', 'files', 'styles', 'scripts', 'templates']);