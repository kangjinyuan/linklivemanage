function getQiniuToken(type, callback) {
	var param = {
		type: type
	};
	request("GET", "property/qiniu/getToken.do", param, true, function(res) {
		callback(res);
	}, function(res) {
		layer.msg("七牛token获取失败");
	})
}

function uploadImageInit(callback) {
	getQiniuToken("0", function(res) {
		var uptoken = res.data;
		if(callback) {
			callback();
		}
		layui.use(['element', 'layer'], function() {
			var element = layui.element;
			var imgUploaders = [];
			$(".upload-img").each(function() {
				var browse_button_id = $(this).attr('id');
				$(this).siblings(".moxie-shim").remove();
				var preview = $(this).parents(".btn-box").siblings().find("img");
				var Qiniu = new QiniuJsSDK();
				var uploader = Qiniu.uploader({
					disable_statistics_report: false,
					runtimes: 'html5,flash,html4',
					browse_button: browse_button_id,
					dragdrop: true,
					uptoken: uptoken,
					domain: imageUrl,
					get_new_uptoken: false,
					auto_start: true,
					log_level: 5,
					multi_selection: false,
					init: {
						'BeforeChunkUpload': function(up, file) {},
						'FilesAdded': function(up, files) {
							plupload.each(files, function(file) {
								// 文件添加进队列后,处理相关的事情
							});
						},
						'BeforeUpload': function(up, file) {
							var nativeFile = file.getNative();
							var img = new Image();
							img.src = URL.createObjectURL(nativeFile);
							img.onload = function() {
								var width = img.naturalWidth;
								var height = img.naturalHeight;
								if(preview.attr("data-width") && preview.attr("data-height")) {
									if(width / height != preview.attr("data-width") / preview.attr("data-height")) {
										uploader.removeFile(file);
										layer.msg("该图片不符合上传规则，请重新上传");
										return false;
									}
								}
								$("body").append("<div class='progress-box'><div class='layui-progress-box'><div class='layui-progress' lay-showpercent='true' lay-filter='progress'><div class='layui-progress-bar' lay-percent='0%'><span class='layui-progress-text'></span></div></div></div></div>");
							}
						},
						'UploadProgress': function(up, file) {
							element.progress('progress', file.percent + '%');
						},
						'FileUploaded': function(up, file, info) {
							layer.msg("上传成功", {
								time: 2000
							}, function() {
								$(".progress-box").remove();
								var domain = up.getOption('domain');
								var res = JSON.parse(info.response);
								var sourceLink = domain + res.key;
								if(browse_button_id == "layuiImg") {
									var img = "<img style='width:100%;text-align:center;' src='" + sourceLink + "'/>"
									$(".layui-layedit iframe").contents().find("body").append(img);
								} else {
									preview.attr("src", sourceLink);
								}
							});
						},
						'Error': function(up, err, errTip) {
							$(".progress-box").remove();
							if(err.code == "-600") {
								layer.msg("文件超过2M");
							} else {
								layer.msg("图片上传失败");
							}
						},
						'UploadComplete': function() {
							//队列文件处理完毕后,处理相关的事情
						},
						'Key': function(up, file) {
							var key = file.id + "." + file.type.split("/")[1];
							return key
						}
					},
					filters: {
						max_file_size: "2M",
						mime_types: [{
							title: "Image files",
							extensions: "pjpeg,jpeg,bmp,jpg,png"
						}]
					}
				});
				imgUploaders.push(uploader);
			});
		});
	});
}

function uploadImageListInit(callback) {
	getQiniuToken("0", function(res) {
		var uptoken = res.data;
		if(callback) {
			callback();
		}
		layui.use(['element', 'layer'], function() {
			var element = layui.element;
			var imgUploaders = [];
			$(".upload-img").each(function() {
				var browse_button_id = $(this).attr('id');
				$(this).siblings(".moxie-shim").remove();
				var Qiniu = new QiniuJsSDK();
				var uploader = Qiniu.uploader({
					disable_statistics_report: false,
					runtimes: 'html5,flash,html4',
					browse_button: browse_button_id,
					dragdrop: true,
					uptoken: uptoken,
					domain: imageUrl,
					get_new_uptoken: false,
					auto_start: true,
					log_level: 5,
					multi_selection: false,
					init: {
						'BeforeChunkUpload': function(up, file) {},
						'FilesAdded': function(up, files) {
							plupload.each(files, function(file) {
								// 文件添加进队列后,处理相关的事情
							});
						},
						'BeforeUpload': function(up, file) {
							var loadding = layer.load(1, {
								shade: [0.2, '#fafafa'],
								area: ['37px', '37px']
							});
						},
						'UploadProgress': function(up, file) {},
						'FileUploaded': function(up, file, info) {
							layer.closeAll('loading');
							var domain = up.getOption('domain');
							var res = JSON.parse(info.response);
							var sourceLink = domain + res.key;
							setData.imageList.push(sourceLink);
							layer.msg("上传成功");
						},
						'Error': function(up, err, errTip) {
							layer.closeAll('loading');
							layer.msg("图片上传失败");
						},
						'UploadComplete': function() {
							//队列文件处理完毕后,处理相关的事情
						},
						'Key': function(up, file) {
							var key = file.id + "." + file.type.split("/")[1];
							return key
						}
					},
					filters: {
						mime_types: [{
							title: "Image files",
							extensions: "pjpeg,jpeg,jpg"
						}]
					},
					resize: {
						width: $(window).width() * 2,
						quality: 80
					}
				});
				imgUploaders.push(uploader);
			});
		});
	});
}

function delImage(i) {
	setData.imageList.splice(i, 1);
	nextTick(function() {
		uploadImageListInit();
	});
}

function uploadVideoInit(callback) {
	getQiniuToken("1", function(res) {
		var uptoken = res.data;
		if(callback) {
			callback();
		}
		layui.use(['element', 'layer'], function() {
			var element = layui.element;
			var videoUploaders = [];
			$(".upload-video").each(function() {
				var browse_button_id = $(this).attr('id');
				$(this).siblings(".moxie-shim").remove();
				var preview = $(this).parents(".btn-box").siblings().find("video");
				var Qiniu = new QiniuJsSDK();
				var uploader = Qiniu.uploader({
					disable_statistics_report: false,
					runtimes: 'html5,flash,html4',
					browse_button: browse_button_id,
					dragdrop: true,
					uptoken: uptoken,
					domain: videoUrl,
					get_new_uptoken: false,
					auto_start: true,
					log_level: 5,
					multi_selection: false,
					init: {
						'BeforeChunkUpload': function(up, file) {},
						'FilesAdded': function(up, files) {
							plupload.each(files, function(file) {
								// 文件添加进队列后,处理相关的事情
							});
						},
						'BeforeUpload': function(up, file) {
							$("body").append("<div class='progress-box'><div class='layui-progress-box'><div class='layui-progress' lay-showpercent='true' lay-filter='progress'><div class='layui-progress-bar' lay-percent='0%'><span class='layui-progress-text'></span></div></div></div></div>");
						},
						'UploadProgress': function(up, file) {
							element.progress('progress', file.percent + '%');
						},
						'FileUploaded': function(up, file, info) {
							layer.msg("上传成功", {
								time: 2000
							}, function() {
								$(".progress-box").remove();
								var domain = up.getOption('domain');
								var res = JSON.parse(info.response);
								var sourceLink = domain + res.key;
								preview.attr("src", sourceLink);
							});
						},
						'Error': function(up, err, errTip) {
							$(".progress-box").remove();
							if(err.code == "-600") {
								layer.msg("文件超过10M");
							} else {
								layer.msg("视频上传失败");
							}
						},
						'UploadComplete': function() {
							//队列文件处理完毕后,处理相关的事情
						},
						'Key': function(up, file) {
							var key = file.id + "." + file.type.split("/")[1];
							return key
						}
					},
					filters: {
						max_file_size: "10M",
						mime_types: [{
							title: "Video files",
							extensions: "flv,wmv,rmvb,mp4,mp3"
						}]
					}
				});
				videoUploaders.push(uploader);
			});
		});
	});
}

function uploadFileInit(callback) {
	getQiniuToken("2", function(res) {
		var uptoken = res.data;
		if(callback) {
			callback();
		}
		layui.use(['element', 'layer'], function() {
			var element = layui.element;
			var fileUploaders = [];
			$(".upload-file").each(function() {
				var browse_button_id = $(this).attr('id');
				$(this).siblings(".moxie-shim").remove();
				var preview = $(this).siblings('input');
				var Qiniu = new QiniuJsSDK();
				var uploader = Qiniu.uploader({
					disable_statistics_report: false,
					runtimes: 'html5,flash,html4',
					browse_button: browse_button_id,
					dragdrop: true,
					uptoken: uptoken,
					domain: fileUrl,
					get_new_uptoken: false,
					auto_start: true,
					log_level: 5,
					multi_selection: false,
					init: {
						'BeforeChunkUpload': function(up, file) {},
						'FilesAdded': function(up, files) {
							plupload.each(files, function(file) {
								// 文件添加进队列后,处理相关的事情
							});
						},
						'BeforeUpload': function(up, file) {
							$("body").append("<div class='progress-box'><div class='layui-progress-box'><div class='layui-progress' lay-showpercent='true' lay-filter='progress'><div class='layui-progress-bar' lay-percent='0%'><span class='layui-progress-text'></span></div></div></div></div>");
						},
						'UploadProgress': function(up, file) {
							element.progress('progress', file.percent + '%');
						},
						'FileUploaded': function(up, file, info) {
							layer.msg("上传成功", {
								time: 2000
							}, function() {
								$(".progress-box").remove();
								var domain = up.getOption('domain');
								var res = JSON.parse(info.response);
								var sourceLink = domain + res.key;
								preview.val(sourceLink);
							});
						},
						'Error': function(up, err, errTip) {
							$(".progress-box").remove();
							if(err.code == "-600") {
								layer.msg("文件超过10M");
							} else {
								layer.msg("文件上传失败");
							}
						},
						'UploadComplete': function() {
							//队列文件处理完毕后,处理相关的事情
						},
						'Key': function(up, file) {
							var key = file.id + "." + file.type.split("/")[1];
							return key
						}
					},
					filters: {
						max_file_size: "10M",
						mime_types: [{
							title: "File files",
							extensions: "txt,doc,xls,docx,xlsx"
						}]
					}
				});
				fileUploaders.push(uploader);
			});
		});
	});
}

function uploadFileListInit(callback) {
	getQiniuToken("2", function() {
		var uptoken = res.data;
		if(callback) {
			callback();
		}
		layui.use(['element', 'layer'], function() {
			var element = layui.element;
			var fileUploaders = [];
			$(".upload-file").each(function() {
				var browse_button_id = $(this).attr('id');
				$(this).siblings(".moxie-shim").remove();
				var Qiniu = new QiniuJsSDK();
				var uploader = Qiniu.uploader({
					disable_statistics_report: false,
					runtimes: 'html5,flash,html4',
					browse_button: browse_button_id,
					dragdrop: true,
					uptoken: uptoken,
					domain: fileUrl,
					get_new_uptoken: false,
					auto_start: true,
					log_level: 5,
					multi_selection: false,
					init: {
						'BeforeChunkUpload': function(up, file) {},
						'FilesAdded': function(up, files) {
							plupload.each(files, function(file) {
								// 文件添加进队列后,处理相关的事情
							});
						},
						'BeforeUpload': function(up, file) {
							$("body").append("<div class='progress-box'><div class='layui-progress-box'><div class='layui-progress' lay-showpercent='true' lay-filter='progress'><div class='layui-progress-bar' lay-percent='0%'><span class='layui-progress-text'></span></div></div></div></div>");
						},
						'UploadProgress': function(up, file) {
							element.progress('progress', file.percent + '%');
						},
						'FileUploaded': function(up, file, info) {
							layer.msg("上传成功", {
								time: 2000
							}, function() {
								$(".progress-box").remove();
								var domain = up.getOption('domain');
								var res = JSON.parse(info.response);
								var name = file.name;
								file.fileName = name.substr(0, name.lastIndexOf("."));
								file.fileType = name.substr(name.lastIndexOf(".") + 1);
								file.sizeUnit = "B";
								if(file.size >= 1024 && file.size < (1024 * 1024)) {
									file.size = (file.size / 1024).toFixed(2);
									file.sizeUnit = "KB";
								} else if(file.size > (1024 * 1024)) {
									file.size = (file.size / (1024 * 1024)).toFixed(2);
									file.sizeUnit = "M";
								}
								var obj = {
									fileUrl: domain + res.key,
									file: file
								}
								setData.fileList.push(obj);
							});
						},
						'Error': function(up, err, errTip) {
							$(".progress-box").remove();
							if(err.code == "-600") {
								layer.msg("文件超过10M");
							} else {
								layer.msg("文件上传失败");
							}
						},
						'UploadComplete': function() {
							//队列文件处理完毕后,处理相关的事情
						},
						'Key': function(up, file) {
							var key = file.id + "." + file.type.split("/")[1];
							return key
						}
					},
					filters: {
						max_file_size: "10M",
						mime_types: [{
							title: "File files",
							extensions: "txt,doc,xls,docx,xlsx"
						}]
					}
				});
				fileUploaders.push(uploader);
			});
		});
	});
}

function delFile(i) {
	setData.fileList.splice(i, 1);
	nextTick(function() {
		uploadFileListInit();
	})
}