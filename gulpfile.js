"use strict";

var gulp            = require('gulp'),
    uglify          = require('gulp-uglify'),
    concat          = require('gulp-concat'),
    sass            = require('gulp-ruby-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    minifycss       = require('gulp-minify-css'),
    plumber         = require('gulp-plumber'),
    imagemin        = require('gulp-imagemin'),
    browserSync     = require('browser-sync'),
    rename          = require('gulp-rename'),
    notify          = require("gulp-notify"),
    cp              = require('child_process'),
    reload          = browserSync.reload;

var src = {
  scss:    './assets/styles/scss/',
  css:     './assets/styles/*.css',
  js:      './assets/scripts/**/*.js',
  img:     './assets/images/**/*',
  fonts:   './assets/fonts/**/*.{ttf,woff,eot,svg}'
}

gulp.task('serve', ['sass', 'scripts', 'build'], function() {
    browserSync({
        server: {
            baseDir: "_site/"
        },
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        },
        notify: false,
        open: "external"
    });

    gulp.watch('./_site/assets/scripts/*.js').on('change', reload);
});

//Build Jekyll
gulp.task('build', function (done) {
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

gulp.task('jekyll-rebuild', ['build'], function () {
    browserSync.reload();
});

gulp.task('scripts', function(){
  gulp.src(['./assets/scripts/**/*.js', '!./assets/scripts/**/*.min.js'])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest('./assets/scripts/'))
    .pipe(gulp.dest('./_site/assets/scripts/')); //
});

gulp.task('sass', function() {
  return sass(src.scss, { 
    style: 'expanded', 
    sourcemap: false 
    })
    .on('error', function(err) {
        notify.onError({
            title: 'Sass Error!',
            message: '<%= error.message %>',
            sound: 'Basso'
        })(err);
    })
    .pipe(autoprefixer())
    .pipe(gulp.dest('./assets/styles'))
    .pipe(minifycss({ keepSpecialComments: 0 }))
    .pipe(rename({suffix: '.min' }))
    .pipe(gulp.dest('./assets/styles'))
    .pipe(gulp.dest('./_site/assets/styles/'))
    .pipe(reload({ stream: true }));
});


gulp.task('watch', function(){  
  gulp.watch(src.scss + '**/*.scss', ['sass']);
  gulp.watch(['./assets/scripts/**/*.js', '!./assets/scripts/**/*.min.js'], ['scripts']);
  gulp.watch(['index.html', '_layouts/*.html', '_includes/*.html', '_posts/*'], ['jekyll-rebuild']);
});


gulp.task('default', ['watch', 'serve']);
