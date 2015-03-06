var gulp = require('gulp');

// Information about your project. Used when generating the styleguide.
// Also handy when building your own gulp tasks.
var project = {
  name: 'Event Blueprint',
  css: {
    unminified: 'default.css',
    minified: 'default.min.css'
  }
};

// Include Our Plugins
var jshint = require('gulp-jshint');
var cssnext = require('gulp-cssnext');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var requireDir = require('require-dir');
var merge = require('merge');
var handlebars = require('gulp-compile-handlebars');
var dirToJson = require('dir-to-json');
var fs = require('fs');

// Load the styleguide app tasks
var app = requireDir('./app');

/* YOU MAY EDIT FROM HERE ON OUT */

var jsSrc = ['./src/*.js','./src/**/*.js'];
var cssSrc = ['./src/*.css','./src/**/*.css'];
var tplSrc = ['./src/templates/*.handlebars','./src/templates/**/*.handlebars'];

// Tasks that compile our project CSS and templates

// Lint Task
gulp.task('lint', function() {
    return gulp.src(jsSrc)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Postprocess our CSS
gulp.task('cssnext', function() {
    return gulp.src('./src/css/main.css')
        .pipe(cssnext())
        .pipe(rename(project.css.unminified))
        .pipe(gulp.dest('./www/css'))
        .pipe(rename(project.css.minified))
        .pipe(cssnext({
          compress: true,
          sourcemap: true
        }))
        .pipe(gulp.dest('./dist/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src(jsSrc)
        .pipe(concat('default.js'))
        .pipe(gulp.dest('./www/js'))
        .pipe(rename('default.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch(jsSrc, ['lint', 'scripts']);
    gulp.watch(cssSrc, ['cssnext']);
    gulp.watch(tplSrc, ['compile']);
});

// Default Task
gulp.task('default', ['styleguide','lint', 'cssnext', 'scripts', 'watch']);
