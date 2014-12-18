/* globals require */
/* jshint node: true */

'use strict';

var config = require('./config');

var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var penthouse = require('penthouse');
var fs = require('fs');
var cleanCSS = require('clean-css');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

// load plugins
var $ = require('gulp-load-plugins')();


gulp.task('penthouse', ['styles'], function () {
   penthouse({
       url: [config.localURL],
       css: config.cssFile,
       width: 480,
       height: 800
   }, function (err, critical) {
       var clean = new cleanCSS().minify(critical);
       fs.writeFile('admin/templates/default_site/layouts.group/critical.html', '<style>' + clean + '</style>');
   });
});

gulp.task('styles', function () {
    return gulp.src(config.scssFile)
        .pipe($.sass({
                errLogToConsole: false,
                onError: function(err) {
                    return $.notify().write(err);
                }
        }))
        .pipe($.autoprefixer('last 2 versions'))
        .pipe(gulp.dest(config.cssDir))
        .pipe(reload({stream:true}))
        .pipe($.size())
        .pipe($.notify('Sass compilation complete.'));
});

gulp.task('scripts', function () {
    return browserify(config.jsMain)
        .bundle()
        .pipe(source('main.bundle.js'))
        .pipe(gulp.dest(config.jsDir))
        .pipe(reload({stream:true}))
        .pipe($.notify('JS compilation complete.'));
});

gulp.task('default', function () {
    gulp.start('watch');
});

gulp.task('serve', ['styles', 'scripts'], function () {
    browserSync({
        proxy: config.localURL,
        hostnameSuffix: '.xip.io'
    });
});

gulp.task('watch', ['serve'], function () {

    // watch for changes
    gulp.watch(config.scssFiles, ['styles']);
    gulp.watch(config.jsFiles, ['scripts']);
});
