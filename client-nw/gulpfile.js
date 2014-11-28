var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');
var watch = require('gulp-watch');
var notify = require("gulp-notify");
var react = require("gulp-react");
var scriptsDir = './js';
var buildDir = './build';
var main = "boot.js";
var destFile = "bundle.js";

function handleErrors(err) {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
    }).apply(this, args);
    gutil.log(err.message);
    this.emit('end'); // Keep gulp from hanging on this task
}


// Based on: http://blog.avisi.nl/2014/04/25/how-to-keep-a-fast-build-with-browserify-and-reactjs/
function buildScript(main, destFile, watch) {
    var props = {
        entries: [scriptsDir + '/'+ main],
        debug: true
    };
    var bundler = watch ? watchify(browserify(props)) : browserify(props);
    bundler.transform(reactify);

    function rebundle() {
        var stream = bundler.bundle();
        return stream.on('error', handleErrors)
            .pipe(source(destFile))
            .pipe(gulp.dest(buildDir + '/js/'));
    }
    bundler.on('update', function() {
        rebundle();
        gutil.log('File Update, Rebundle...');
    });
    return rebundle();
}


//sync resources file
gulp.task('sync', function() {
    gutil.log('Watching file...');
    gulp.src([
        './bower_components/bootstrap/dist/css/bootstrap.css',
        './bower_components/bootstrap/dist/css/bootstrap-theme.css'
    ]).pipe(gulp.dest('./css/lib'));
    var cssFiles = './css/**/*.css',
        images = './images/**/*',
        fonts = './fonts/**/*',
        index = './index.html',
        js = './js/nw/**/*.js';
    gulp.src(cssFiles)
        .pipe(watch(cssFiles, function (files) {
            return files.pipe(gulp.dest([buildDir, 'css/'].join('/')));
        }));
    gulp.src(images)
        .pipe(watch(images, function (files) {
            return files.pipe(gulp.dest([buildDir, 'images/'].join('/')));
        }));
    gulp.src(js)
        .pipe(watch(js, function (files) {
            return files.pipe(gulp.dest(buildDir + '/js/nw/'));
        }));
    gulp.src(index)
        .pipe(watch(index, function (file) {
            return file.pipe(gulp.dest(buildDir));
        }));
    return gulp.src(fonts)
        .pipe(watch(fonts, function (files) {
            return files.pipe(gulp.dest([buildDir, 'fonts/'].join('/')));
        }));
        //.pipe(minifyCSS({
        //    keepBreaks: true
        //}))
        //.pipe(concat('main.css'))
        /*.pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist/'))
        .pipe(notify({
            message: 'CSS压缩完成'
        }));*/
});

gulp.task('build', function() {
    return buildScript(main, destFile, false);
});


gulp.task('default', ['build'], function() {
    return buildScript(main, destFile, true);
});