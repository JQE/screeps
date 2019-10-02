var gulp = require('gulp');
var screeps = require('gulp-screeps');
var credentials = require('./credentials.js');
var rename = require('gulp-rename'); 
var clean = require('gulp-clean');
var log = require('fancy-log');

gulp.task('clean', function() {
    return gulp.src('./dist/*.js', {read: false})
    .pipe(clean());
});

gulp.task('rename', function() {
  return gulp.src('./src/**/*.js')
    .pipe(rename(function(path) {
        var name = path.dirname+"\\"+path.basename;
        log(name);
        name = name.replace(/\\/g,'_');        
        path.basename = name.replace(/^(._)/,"");
        path.dirname = "";
        path.extname =".js"
    }))
    .pipe(gulp.dest("./dist"));
});

gulp.task('screeps', function() {
    return gulp.src('./dist/*.js')
        .pipe(screeps(credentials.online));
});

gulp.task('local', function() {
    return gulp.src('./dist/*.js')
    .pipe(screeps(credentials.private));
});

gulp.task('online', gulp.series('clean','rename','screeps'));
gulp.task('private',gulp.series('clean','rename','local'));
