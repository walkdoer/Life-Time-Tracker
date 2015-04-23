// We need a bunch of dependencies, but they all do an important
// part of this workflow
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify'); 
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var glob = require('glob');
var livereload = require('gulp-livereload');
var jasminePhantomJs = require('gulp-jasmine2-phantomjs');
var packageJSON = require('./package.json');
var inject = require("gulp-inject");
var rename = require('gulp-rename');

// We create an array of dependencies. These are NPM modules you have
// installed in node_modules. Think: "require('react')" or "require('underscore')"


var dependencies = Object.keys(packageJSON.dependencies).concat(Object.keys(packageJSON.browser));
dependencies = dependencies.concat([
    // './libs/bootstrap-datepicker.js',
    // './libs/cal-heatmap.js',
    // './libs/daterangepicker.js',
    // './libs/d3.layout.cloud.js',
    'react/addons'
    //'react/lib/cx'
]);

console.log(dependencies);


// Now this task both runs your workflow and deploys the code,
// so you will see "options.development" being used to differenciate
// what to do
var browserifyTask = function (options) {

    /*
     First we define our application bundler. This bundle is the
     files you create in the "app" folder */
    var appBundler = browserify({
        entries: [options.src], // The entry file, normally "main.js"
        transform: [reactify], // Convert JSX style
        debug: options.development, // Sourcemapping
        cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
    });

    /* We set our dependencies as externals of our app bundler.
     For some reason it does not work to set these in the options above */
    appBundler.external(options.development ? dependencies : []);
  
    /* This is the actual rebundle process of our application bundle. It produces
    a "main.js" file in our "build" folder. */
    var rebundle = function () {
        var start = Date.now();
        console.log('Building APP bundle');
        appBundler.bundle()
          .on('error', gutil.log)
          .pipe(source('main.js'))
          .pipe(gulpif(!options.development, streamify(uglify())))
          .pipe(gulp.dest(options.dest))
          .pipe(gulpif(options.development, livereload())) // It notifies livereload about a change if you use it
          .pipe(notify(function () {
            console.log('APP bundle built in ' + (Date.now() - start) + 'ms');
          }));
    };

    /* When we are developing we want to watch for changes and
    trigger a rebundle */
    if (options.development) {
        appBundler = watchify(appBundler);
        appBundler.on('update', rebundle);
    }

    // And trigger the initial bundling
    rebundle();

    if (options.development) {

  //   // We need to find all our test files to pass to our test bundler
  //   var testFiles = glob.sync('./specs/**/*-spec.js');

  //   /* This bundle will include all the test files and whatever modules
  //      they require from the application */
  //   var testBundler = browserify({
  //     entries: testFiles,
  //     debug: true,
  //     transform: [reactify],
  //     cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
  //   });

  //   // Again we tell this bundle about our external dependencies
  //   testBundler.external(dependencies);

  //   /* Now this is the actual bundle process that ends up in a "specs.js" file
  //     in our "build" folder */
  //   var rebundleTests = function () {
  //     var start = Date.now();
  //     console.log('Building TEST bundle');
  //     testBundler.bundle()
  //       .on('error', gutil.log)
  //       .pipe(source('specs.js'))
  //       .pipe(gulp.dest(options.dest))
  //       .pipe(livereload()) // Every time it rebundles it triggers livereload
  //       .pipe(notify(function () {
  //         console.log('TEST bundle built in ' + (Date.now() - start) + 'ms');
  //       }));
  //   };

    // We watch our test bundle
    //testBundler = watchify(testBundler);

    // We make sure it rebundles on file change
    //testBundler.on('update', rebundleTests);

    // Then we create the first bundle
    //rebundleTests();

        /* And now we have to create our third bundle, which are our external dependencies,
      or vendors. This is React JS, underscore, jQuery etc. We only do this when developing
      as our deployed code will be one file with all application files and vendors */
        var vendorsBundler = browserify({
            debug: false, // It is nice to have sourcemapping when developing
            require: dependencies
        });

        /* We only run the vendor bundler once, as we do not care about changes here,
          as there are none */
        var start = new Date();
        console.log('Building VENDORS bundle');
        vendorsBundler.bundle()
          .on('error', gutil.log)
          .pipe(source('vendors.js'))
          .pipe(gulpif(true/*!options.development*/, streamify(uglify())))
          .pipe(gulp.dest(options.dest))
          .pipe(notify(function () {
            console.log('VENDORS bundle built in ' + (Date.now() - start) + 'ms');
          }));
    }

}

// We also have a simple css task here that you can replace with
// SaSS, Less or whatever
var cssTask = function (options) {
    if (options.development) {
      var run = function () {
        gulp.src(options.src)
          .pipe(concat('main.all.css'))
          .pipe(gulp.dest(options.dest));
      };
      run();
      gulp.watch(options.src, run);
    } else {
      gulp.src(options.src)
        .pipe(concat('main.all.css'))
        .pipe(cssmin())
        .pipe(gulp.dest(options.dest));
    }
};

// Starts our development workflow
gulp.task('default', function () {

  browserifyTask({
    development: true,
    src: './boot.js',
    dest: './'
  });

  cssTask({
    development: true,
    src: './css/**/*.css',
    dest: './'
  });

});

// Deploys code to our "dist" folder
gulp.task('deploy', function () {

  browserifyTask({
    development: false,
    src: './boot.js',
    dest: './dist'
  });

  cssTask({
    development: false,
    src: './css/**/*.css',
    dest: './dist'
  });

});

// Runs the test with phantomJS and produces XML files
// that can be used with f.ex. jenkins
gulp.task('test', function () {
    return gulp.src('./build/testrunner-phantomjs.html').pipe(jasminePhantomJs());
});



gulp.task('html', function() {
    gutil.log('Watching html file...');
    var htmlFile = './index.src.html';
    var appResources = [
        './nw/initNW.js',
        './vendors.js',
        './main.js',
        './css/lib/normalize.css',
        './css/lib/**/*.css',
        './css/ltt.css',
        './css/main.css',
        './css/**/*.css',
    ];
    injectScript(gulp.src(htmlFile), appResources, 'index.html', './');
    gulp.watch(htmlFile, function () {
        var target = gulp.src(htmlFile);
        injectScript(target, appResources, 'index.html', './');
    });

    // var addLogHTML = './node_modules/ltt-addLog/index.src.html',
    //     addLogResources = [
    //         './node_modules/ltt-addLog/css/lib/normalize.css',
    //         './node_modules/ltt-addLog/css/lib/**/*.css',
    //         './node_modules/ltt-addLog/css/addLog.css',
    //         './node_modules/ltt-addLog/css/*.css',
    //         /**js*/
    //         './node_modules/ltt-addLog/addLog.js'
    //     ],
    //     addLogBuildDir = './node_modules/ltt-addLog';

    // injectScript(gulp.src(addLogHTML), addLogResources, 'addLog.html', addLogBuildDir);
    //gulp.watch(addLogHTML, function () {
      //  var target = gulp.src(addLogHTML);
        // injectScript(target, addLogResources, 'addLog.html', addLogBuildDir);
    //});


    function injectScript(file, resources, destFile, buildDir) {
        gutil.log('Rebuild ' + destFile + ' file...');
        var sources = gulp.src(resources, {
            read: false
        });
        return file.pipe(inject(sources, {relative: true}))
            .pipe(rename(destFile))
            .pipe(gulp.dest(buildDir))
            .pipe(gulp.dest('./build'));
    }
});
