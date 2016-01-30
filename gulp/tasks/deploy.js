var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');

gulp.task('deploy', ['build'], () => {
  return gulp.src('dist/**/*')
          .pipe(ghPages());
});
