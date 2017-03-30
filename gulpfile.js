
var gulp = require('gulp');
var bower = require('bower');
var templateCache = require('gulp-angular-templatecache');
var concat = require('gulp-concat');

var paths = {
  sass: ['./scss/**/*.scss'],
  templates : ['./www/templates/**/*.html'],
  appSettings : ['./template/settings.js']
};

var preprocess = require('gulp-preprocess');
gulp.task('dev', function() {
  gulp.src(paths.appSettings)
    .pipe(preprocess({context: { NODE_ENV: 'DEVELOPMENT', DEBUG: true}}))
    .pipe(gulp.dest('./www/js/'));
});
gulp.task('prod', function() {
  gulp.src(paths.appSettings)
    .pipe(preprocess({context: { NODE_ENV: 'PRODUCTION'}}))
    .pipe(gulp.dest('./www/js/'));
});

gulp.task('templates', function(){
  gulp.src(paths.templates)
    .pipe(templateCache({
      standalone:true,
      root: 'templates'}))
    .pipe(gulp.dest('./www/lib'));
});

gulp.task('watch', function(){
  gulp.watch(paths.templates, ['templates']);
});

gulp.task('defaultprod', ['prod', 'templates']);
gulp.task('defaultdev', ['dev', 'templates']);
