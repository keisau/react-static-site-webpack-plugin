const path = require('path')
const gulp = require('gulp')
const babel = require('gulp-babel')
const clean = require('gulp-clean')
const gutil = require('gulp-util')

const files = {
	gulpfile: path.resolve(__dirname, 'gulpfile.js'),
	src: `${path.resolve(__dirname, 'src')}/**/*.js`,
	lib: path.resolve(__dirname, 'lib')
}

gulp.task('lib:clean', () => {
	return gulp.src(files.lib, { read: false })
	.pipe(clean())
})

gulp.task('lib:build', () => {
	return gulp.src(files.src)
	.pipe(babel())
	.pipe(gulp.dest(files.lib))
})

gulp.task('watch:lib', ['lib:build'], () => {
	gulp.watch(files.src, ['lib:build'])
})

gulp.task('default', ['watch:lib'])
