var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var cssnext = require('gulp-cssnext');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var handlebars = require('gulp-compile-handlebars');
var dirToJson = require('dir-to-json');
var colors = require('colors');
var express = require('express');
var app = express();
var hbs = require('hbs');
var fs = require('fs');

// Information about your project resides inside this file.
// Used when generating the styleguide.
// Also handy when building your own gulp tasks.
var project = {
  "name": "Event Blueprint",
  "css": {
    "unminified": "default.css",
    "minified": "default.min.css"
  }
};

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

  // Loop through our templates folder.
  fs.readdir('./src/templates', function(err, items){
    if(!err) {
      // For each item, if we encounter a folder, read the directory

      for(var i = 0; i < items.length; i++) {
        if(fs.lstatSync('./src/templates/' + items[i]).isDirectory()) {
          sampleData('./src/templates/' + items[i]);
        }
      }
    } else {
      throw err;
    }
  });

  function sampleData(dir) {
    fs.readdir(dir, function(err, items){
      if(!err) {

        // For each item, if we encounter a template file
        for(var i = 0; i < items.length; i++) {
          if(!fs.lstatSync(dir + '/' + items[i]).isDirectory()) {
            var template = dir + '/' + items[i];
            var partials = dir + '/partials';
            var jsonFile = dir + '/sample-data/' + items[i].replace('.handlebars','.json');
            fs.open(jsonFile, 'r', function(err, fd){
              if(err && err.code == 'ENOENT') {
                console.log('Sample data doesn\'t exist. Creating...');
                // Create dir
                fs.mkdir(dir + '/sample-data/', function() {
                  var json = '[{}]';
                  // Then create default .json file.
                  fs.writeFile(jsonFile, json, function() {
                    generatePartial(template, jsonFile, partials);
                  });
                });
                // Create entity, if it doesn't exist.
                console.log('Should create entity if it doesn\'t exist');

              } else if(err) {
                // Errors other than no entity.
                throw err;
              } else {
                // Entity exists! We have sample-data. Compile our handlebars.
                console.log('Using sample data for ' + jsonFile.replace('.json','') );
                generatePartial(template, jsonFile, partials);
              }
            });
          }
        }
      } else {
        throw err;
      }
    });
  };

  function generatePartial(tpl, data, partials) {
    return gulp.src(tpl)
      .pipe(handlebars(getData(data),{
        batch: [partials]
      }))
      .pipe(gulp.dest('./www/views/partials'));
  };

});

gulp.task('compile', ['precompile'], function() {
  return gulp.src('./app/templates/layout.handlebars')
          .pipe(handlebars(
            getData('./app/data/project.json'),
              {
                ignorePartials: true,
                batch : ['./app/templates/partials']
              }
          ))
          .pipe(rename('index.handlebars'))
          .pipe(gulp.dest('./www/views'));
});

function getData(src) {
  return JSON.parse(fs.readFileSync(src));
};

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

// App routing
gulp.task('launch-app', function() {

  var server = app.listen(3000, function(){
    var port = server.address().port;

    console.log('Styleguide launched at http://%s:%s'.green, 'localhost', port);
  });

  app.set('view engine', 'handlebars');
  app.set('views', './www/views/');
  app.engine('handlebars', require('hbs').__express);
  hbs.registerPartials('./www/views/partials');

  app.get('/', function (req, res) {
    res.render('index');
  });

  app.get('/:template', function(req, res) {

    renderTemplate('./www/views/partials/' + req.params.template + '.handlebars');
    setTimeout( function() {
      res.render('index')
    }, 20);
  });

});

// Render handlebars template in view
function renderTemplate (tpl) {
  console.log('Rendering '.cyan + tpl.cyan)
  return gulp.src('./app/templates/layout.handlebars')
    .pipe(handlebars(
      getData('./app/data/project.json'),
        {
          ignorePartials: true,
          partials: {
            template: fs.readFileSync(tpl, {encoding: 'utf-8'})
          },
          batch : ['./app/templates/partials']
        }
    ))
    .pipe(rename('index.handlebars'))
    .pipe(gulp.dest('./www/views'));
};

// Watch Files For Changes
gulp.task('watch-app', function() {
    gulp.watch(appJsSrc, ['compile-app-js']);
    gulp.watch(appCssSrc, ['compile-app-css']);
    gulp.watch(appTplSrc, ['compile']);
});

// Compile the styleguide app and launch it
gulp.task('styleguide', ['compile','compile-app-css','compile-app-js','launch-app','watch-app']);
