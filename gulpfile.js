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
var NwBuilder = require('node-webkit-builder');
var watch = require('gulp-watch');
var buildDir = './';
var babelify = require("babelify");
var argv = require('yargs').argv;

// We create an array of dependencies. These are NPM modules you have
// installed in node_modules. Think: "require('react')" or "require('underscore')"


var dependencies = Object.keys(packageJSON.dependencies).concat(Object.keys(packageJSON.browser));
dependencies = dependencies.concat([
    'react/addons'
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
          .pipe(source(options.destFile))
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
          .pipe(gulpif(!options.development, streamify(uglify())))
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
  livereload.listen();
  browserifyTask({
    development: true,
    src: './boot.js',
    destFile: 'main.js',
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
    destFile: 'main.js',
    dest: buildDir
  });

  cssTask({
    development: false,
    src: './css/**/*.css',
    dest: buildDir
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



//sync resources file
gulp.task('sync', function() {
    var cssFiles = './css/**/*',
        images = './images/**/*',
        fonts = './fonts/**/*',
        libs = './libs/**/*',
        lttNw = './node_modules/ltt-nw/**/*',
        js = './nw/**/*.js';

    gulp.src(libs).pipe(gulp.dest([buildDir, 'libs/'].join('/')));
    gulp.src('./node_modules/sweetalert/dist/sweetalert.css')
      .pipe(gulp.dest('./css/lib/'))
      .pipe(gulp.dest([buildDir, 'css/lib/'].join('/')));
    gulp.src(cssFiles)
        .pipe(watch(cssFiles, function(files) {
            return files.pipe(gulp.dest([buildDir, 'css/'].join('/')));
        }));

    gulp.src(lttNw)
        .pipe(watch(lttNw, function (files) {
            return files.pipe(gulp.dest([buildDir, 'node_modules/ltt-nw'].join('/')));
        }));
    gulp.src(images)
        .pipe(watch(images, function(files) {
            return files.pipe(gulp.dest([buildDir, 'images/'].join('/')));
        }));
    gulp.src(js)
        .pipe(watch(js, function(files) {
            return files.pipe(gulp.dest(buildDir + '/nw/'));
        }));

    return gulp.src(fonts)
        .pipe(watch(fonts, function(files) {
            return files.pipe(gulp.dest([buildDir, 'fonts/'].join('/')));
        }));
});



gulp.task('nw', function () {
    var trackerPackage = require('./node_modules/tracker/package.json');
    var dependencies = Object.keys(trackerPackage.dependencies).map(function (moduleName) {
      return './node_modules/' + moduleName + '/**/*';
    }).concat([
      './node_modules/jquery/**/*',
      './node_modules/tracker/**/*',
      './node_modules/ltt-sdk/**/*',
      './node_modules/ltt-nw/**/*',
      '!./node_modules/tracker/node_modules/**/**',
    ]);
    var files = [
          './package.json',
          './css/**/*',
          './fonts/**/*',
          './images/**/*',
          './nw/**/*',
          './libs/**/*',
          './index.html',
          './server.html',
          './vendors.js',
          './nodeMain.js',
          './main.js'
        ].concat(dependencies);

    console.log(files);
    var nw = new NwBuilder({
        files: files,
        platforms: ['osx64'],
        buildDir: './production',
        macIcns: './app.icns',
        version: argv.version
    });
    console.log(argv);
    // Log stuff you want
    nw.on('log', function (msg) {
        gutil.log('node-webkit-builder', msg);
    });
    // Build returns a promise, return it so the task isn't called in parallel
    return nw.build().then(function () {
       console.log('build nw all done!');
    }).catch(function (error) {
        gutil.log('node-webkit-builder', error);
    });
});
