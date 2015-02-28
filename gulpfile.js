var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var cssnext = require('gulp-cssnext');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var merge = require('merge');
var handlebars = require('gulp-compile-handlebars');
var dirToJson = require('dir-to-json');
var fs = require('fs');

var appJsSrc = ['app/src/*.js','app/src/**/.js'];
var appCssSrc = ['app/src/*.css','app/src/**/.css'];

var jsSrc = ['src/*.js','src/**/.js'];
var cssSrc = ['src/*.css','src/**/.css'];

var project = {
  name: 'Event Blueprint',
  css: {
    unminified: 'default.css',
    minified: 'default.min.css'
  }
};

// Tasks that compile our styleguide app and launches it

gulp.task('precompile', function() {
  dirToJson('./src/templates', function(err, dirTree) {
    if(err) {
      throw err;
    } else {
      project.tree = dirTree;
      fs.writeFile('./app/data/project.json', JSON.stringify(project), function(err) {
        if(err) throw err;
      });
    }
  });
});

gulp.task('compile', ['precompile'], function() {
  return gulp.src('./app/templates/index.handlebars')
    .pipe(handlebars(getData('./app/data/project.json'),{
      batch : ['./app/templates/partials'],
    }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./www'));
});

function getData(src) {
  return JSON.parse(fs.readFileSync(src));
};

// Start server
gulp.task('compile-styleguide', ['compile'], function() {
  connect.server({
    root: 'www',
    livereload: true
  });
});


// Tasks that compile our project CSS and templates

// Lint Task
gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Postprocess our CSS
gulp.task('cssnext', function() {
    return gulp.src(cssSrc)
        .pipe(cssnext())
        .pipe(rename(project.css))
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
});

// Default Task
gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);

// Compile the styleguide app and launch it
gulp.task('styleguide', ['compile-styleguide']);
