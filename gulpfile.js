var gulp = require("gulp");
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins({
	lazyload: true,
	rename: {
		"gulp-ruby-sass": "sass",
		"gulp-markdown-pdf": "mdpdf",
		"gulp-rev-collector": "revCollector",
		"gulp-asset-rev": "assetRev"
	}
});

var cssList = ["css/app.css", "css/common.css", "css/login.css", "css/main.css"];
var jsList = ["js/app.js", "js/common.js", "js/init.js", "js/login.js", "js/selectData.js", "js/rightNav.js", "js/upload.js", "js/requestUrl.js", "js/editInit.js", "js/chinaNumToEnglishNum.js"];

function resetFile(taskName, srcList, fileType) {
	gulp.task(taskName, function(done) {
		return gulp.src(srcList)
			.pipe($.rev()) //添加hash后缀
			.pipe($.rev.manifest()) //生成文件映射
			.pipe(gulp.dest("rev/" + fileType)) //将映射文件导出到rev/css中
		done()
	});
}

function resetHtml(taskName, savePath) {
	gulp.task(taskName, function(done) {
		return gulp.src(["rev/**/*.json", savePath + "/*.html"])
			.pipe($.revCollector())
			.pipe(gulp.dest(savePath))
		done()
	});
}

resetFile("resetCss", cssList, "css");
resetFile("resetJS", jsList, "js");
resetHtml("resetMainHtml", ".");
resetHtml("resetPagesHtml", "pages");
resetHtml("resetPartsHtml", "parts");

gulp.task('default', gulp.series("resetCss", "resetJS", gulp.parallel("resetMainHtml", "resetPagesHtml", "resetPartsHtml")));