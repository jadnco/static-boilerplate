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

var paths = {
  src: { root: 'src' },
  dist: { root: 'dist' },
  init: function() {
    this.src.sass        = this.src.root + '/scss/main.scss';
    this.src.templates   = this.src.root + '/**/*.hbs';
    this.src.javascript  = [this.src.root + '/js/**/*.js','!' + this.src.root + '/js/libs/*.js'];
    this.src.libs        = this.src.root + '/js/libs/*.js';
    this.src.images      = this.src.root + '/images/**/*.{jpg,jpeg,svg,png,gif}';
    this.src.files       = this.src.root + '/*.{html,txt}';

    this.dist.css        = this.dist.root + '/css';
    this.dist.images     = this.dist.root + '/images';
    this.dist.javascript = this.dist.root + '/js';
    this.dist.libs       = this.dist.root + '/js/libs';
    
    return this;
  }
}.init();

gulp.task('serve', function() {
  browserSync.init({
    server: paths.dist.root,
    open: false,
    notify: false
  });
});

gulp.task('styles', function() {
  gulp.src([paths.src.sass])
    .pipe(sassGlob())
    .on('error', util.log)
    .pipe(sass({
      includePaths: ['src/scss']
    }))
    .on('error', util.log)
    .pipe(prefixer('last 2 versions'))
    .on('error', util.log)
    .pipe(gulp.dest(paths.dist.css))
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

  gulp.src([paths.src.root + '/*.hbs'])
    .pipe(handlebars(null, opts))
    .on('error', util.log)
    .pipe(rename({
      extname: '.html'
    }))
    .on('error', util.log)
    .pipe(gulp.dest(paths.dist.root))
    .pipe(browserSync.reload({stream: true}));
});

/*
* Bundle all javascript files
*/
gulp.task('scripts', function() {
  gulp.src(paths.src.javascript)
    .pipe(concat('bundle.js'))
    .on('error', util.log)
    .pipe(uglify())
    .on('error', util.log)
    .pipe(gulp.dest(paths.dist.javascript));

  /*
  * Uglify JS libs and move to dist folder
  */
  gulp.src([paths.src.libs])
    .pipe(uglify())
    .on('error', util.log)
    .pipe(rename({
      suffix: '.min'
    }))
    .on('error', util.log)
    .pipe(gulp.dest(paths.dist.libs));
});

gulp.task('images', function() {
  gulp.src([paths.src.images])
    .pipe(gulp.dest(paths.dist.images));
});

gulp.task('clean:images', function(a) {
  del([paths.dist.images], a);
});

gulp.task('files', function() {
  gulp.src([paths.src.files])
    .pipe(gulp.dest(paths.dist.root));
});

gulp.task('clean:files', function(a) {
  del([paths.dist.root + '/*.{html,txt}'], a);
});

gulp.task('watch', function() {
  gulp.watch('src/scss/**/*.scss', ['styles']);
  gulp.watch(paths.src.javascript, ['scripts']);
  gulp.watch(paths.src.templates, ['templates']);
  gulp.watch(paths.src.files, ['clean:files', 'files']);
  gulp.watch(paths.src.images, ['clean:images', 'images']);
});

gulp.task('deploy', function() {
  return gulp.src([paths.dist.root + '/**/*'])
    .pipe(ghPages());
});

gulp.task('default', ['watch', 'serve', 'images', 'files', 'styles', 'scripts', 'templates']);