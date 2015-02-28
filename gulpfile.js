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
var merge = require('merge');
var handlebars = require('gulp-compile-handlebars');
var dirToJson = require('dir-to-json');
var fs = require('fs');

/* DO NOT EDIT FROM HERE ON OUT */

var appJsSrc = ['./app/src/*.js','./app/src/**/*.js'];
var appCssSrc = ['./app/src/*.css','./app/src/**/*.css'];
var appTplSrc = ['./app/templates/*.handlebars','./app/templates/**/*.handlebars'];

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

  fs.readdir('./src/templates', function(err, files){
    if(err) {
      throw err;
    } else {
      for(var dir = 0; dir < files.length; dir++) {
        fs.readdir('./src/templates/' + files[dir], function(err, filesLv2){
          if(err) {
            throw err;
          } else {
            console.log(filesLv2);
          }
        });
      }
    }
  });

});

gulp.task('compile', ['precompile'], function() {
  return gulp.src('./app/templates/index.handlebars')
    .pipe(handlebars(getData('./app/data/project.json'),{
      batch : ['./app/templates/partials','./www/partials']
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

// Compile app css
gulp.task('compile-app-css', function() {
  return gulp.src(appCssSrc)
      .pipe(cssnext())
      .pipe(rename('styleguide-master.css'))
      .pipe(gulp.dest('./www/app/css'));
});

// Compile app js
gulp.task('compile-app-js', function() {
  return gulp.src(appJsSrc)
      .pipe(jshint())
      .pipe(concat('styleguide.js'))
      .pipe(gulp.dest('./www/app/js'));
});

// Watch Files For Changes
gulp.task('watch-app', function() {
    gulp.watch(appJsSrc, ['compile-app-js']);
    gulp.watch(appCssSrc, ['compile-app-css']);
    gulp.watch(appTplSrc, ['compile']);
});

// Compile the styleguide app and launch it
gulp.task('styleguide', ['compile-styleguide','compile-app-css','compile-app-js','watch-app']);

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
