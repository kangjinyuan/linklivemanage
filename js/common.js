//登录返回的accessToken令牌
var accessToken = window.localStorage.getItem("accessToken");
var accountInfo = window.localStorage.getItem("accountInfo") ? JSON.parse(window.localStorage.getItem("accountInfo")) : getUrlParam("accountInfo");

//数字正则表达式
var regular_number = /^(\-|\+)?\d+(\.\d+)?$/;

//整数正则表达式
var regular_int = /^(\-|\+)?\d+$/;

//正数正则表达式
var regular_positive_number = /^\d+(\.\d+)?$/;

//正整数正则表达式
var regular_positive_int = /^\d+$/;

//手机正则表达式
var regular_telephone = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;

//密码号正则表达式
var regular_password = /^[A-Za-z0-9]{4,16}$/;

//邮箱正则表达式
var regular_email = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

//身份证正则表达式
var regular_id_number = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/;

//房屋地址
var regular_room_address = /^[0-9-]{7,11}$/;

//code正则表达式
var regular_code = /^[A-Za-z0-9]*$/;

var setData, maskArray = [];

var param = {
	menuList: [],
	selected: "",
	path: "",
	parentData: "",
	isInit: false,
	dataList: [],
	contentList: [],
	imageList: [],
	fileList: [],
	allIsActive: false,
	pageList: [],
	totalPage: 0,
	pageSize: 0,
	pageNo: 0,
	count: 0,
	dataLength: 0,
	accountInfo: accountInfo
}

//加载VUE
function loadVue(el, param) {
	setData = new Vue({
		el: el,
		data: param,
		filters: {
			resetTime: function(time, flag) {
				if(time == null) {
					return "";
				} else {
					return resetTime(time, flag);
				}
			}
		}
	})
}

//页面渲染完毕之后回调
function nextTick(callback) {
	Vue.nextTick(function() {
		callback();
	});
}

//刷新页面
function reloadPage() {
	window.location.reload();
}

//返回上一级页面
function goBack(index) {
	window.history.go(index);
}

//公共请求方法
//method 请求方式
//requestUrl 请求地址
//isPage 请求是否设置翻页
//param 参数
//okCallback 成功回调
//noCallback 失败回调
function request(method, requestUrl, param, showLoading, okCallback, noCallback) {
	if(param.page) {
		var isPage = true;
	} else {
		var isPage = false;
	}
	if(accessToken) {
		param.accessToken = accessToken;
	}
	var timestamp = new Date().getTime();
	if(method == "POST") {
		param = JSON.stringify(param);
	}
	if(showLoading == true) {
		var loadding = layer.load(1, {
			shade: [0.2, '#fafafa'],
			area: ['37px', '37px']
		});
	}
	requestUrl = editUrlParam("timestamp", timestamp, requestUrl);
	$.ajax({
		type: method,
		url: url + requestUrl,
		contentType: "application/json;charset=UTF-8",
		data: param,
		dataType: 'json',
		complete: function(res) {
			if(showLoading) {
				layer.closeAll('loading');
			}
		},
		success: function(res) {
			if(res.code == "0000") {
				okCallback(res);
			} else if(res.code == "0007" || res.code == "0006") {
				quit();
			} else if(res.code == "0008") {
				layer.msg("服务器内部错误");
			} else if(res.code == "0400") {
				layer.msg("服务达到上限，如想创建请联系闪向");
			} else if(res.code == "0500") {
				layer.msg("第三方关联楼宇房屋错误，请联系闪向");
			} else if(res.code == "0501") {
				layer.msg("第三方关联楼宇单元错误，请联系闪向");
			} else if(res.code == "0502") {
				layer.msg("第三方关联社区错误，请联系闪向");
			} else {
				noCallback(res);
			}
			if(isPage == true) {
				var data = res.data;
				idList = [];
				setData.dataLength = data.dataList.length;
				setData.pageNo = data.pageNo;
				setData.pageSize = data.pageSize;
				setData.totalPage = data.totalPage;
				setData.count = data.count;
				resetPage();
			}
		},
		error: function(res) {
			if(res.status == '401' || res.status == '402' || res.status == '403' || res.status == '404' || res.status == '405' || res.status == '407' || res.status == '413' || res.status == '414' || res.status == '415' || res.status == '500' || res.status == '502' || res.status == '503' || res.status == '504' || res.status == '505') {
				window.location.href = absoluteUrl + 'parts/err.html';
			}
		}
	});
}

//海康请求
function hikRequest(method, requestUrl, param, showLoading, okCallback, noCallback) {
	if(param.pageNo) {
		var isPage = true;
	} else {
		var isPage = false;
	}
	if(method == "POST") {
		param = JSON.stringify(param);
	}
	var timestamp = new Date().getTime();
	if(showLoading == true) {
		var loadding = layer.load(1, {
			shade: [0.2, '#fafafa'],
			area: ['37px', '37px']
		});
	}
	$.ajax({
		type: method,
		url: requestUrl + "?timestamp=" + timestamp,
		contentType: "application/json;charset=UTF-8",
		data: param,
		dataType: 'json',
		success: function(res) {
			if(res.code == "0") {
				okCallback(res);
			} else {
				noCallback(res);
			}
			if(isPage == true) {
				idList = [];
				var dataInfo = res.data;
				setData.dataLength = dataInfo.list.length;
				if(dataInfo.totalPage) {
					setData.totalPage = dataInfo.totalPage;
				}
				setData.pageSize = dataInfo.pageSize;
				setData.currentPage = dataInfo.pageNo;
				setData.count = dataInfo.total;
			}
			if(showLoading == true) {
				layer.closeAll('loading');
			}
		},
		error: function(res) {
			if(res.status == '401' || res.status == '402' || res.status == '403' || res.status == '404' || res.status == '405' || res.status == '407' || res.status == '413' || res.status == '414' || res.status == '415' || res.status == '500' || res.status == '502' || res.status == '503' || res.status == '504' || res.status == '505') {
				window.location.href = absoluteUrl + 'parts/err.html';
			}
		}
	});
}

//格式化字符串时间
function resetDate(date) {
	if(typeof(date) == "string") {
		date = date.substring(0, 19);
		date = date.replace(/-/g, '/');
	}
	date = new Date(date);
	return date;
}

//格式化时间
Date.prototype.Format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份           
		"d+": this.getDate(), //日           
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时           
		"H+": this.getHours(), //小时           
		"m+": this.getMinutes(), //分           
		"s+": this.getSeconds(), //秒           
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度           
		"S": this.getMilliseconds() //毫秒           
	};
	var week = {
		"0": "日",
		"1": "一",
		"2": "二",
		"3": "三",
		"4": "四",
		"5": "五",
		"6": "六"
	};
	if(/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	if(/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "周") : "") + week[this.getDay() + ""]);
	}
	for(var k in o) {
		if(new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

//重置时间
function resetTime(date, flag) {
	if(date) {
		date = resetDate(date);
		if(flag == 0) {
			return date.Format("yyyy-MM-dd HH:mm:ss");
		} else if(flag == 1) {
			return date.Format("yyyy-MM-dd HH:mm");
		} else if(flag == 2) {
			return date.Format("yyyy-MM-dd HH");
		} else if(flag == 3) {
			return date.Format("yyyy-MM-dd");
		} else if(flag == 4) {
			return date.Format("yyyy-MM");
		} else if(flag == 5) {
			return date.Format("yyyy");
		} else if(flag == 6) {
			return date.Format("yyyy年MM月dd日 HH时mm分ss");
		} else if(flag == 7) {
			return date.Format("yyyy年MM月dd日 HH时mm分");
		} else if(flag == 8) {
			return date.Format("yyyy年MM月dd日 HH时");
		} else if(flag == 9) {
			return date.Format("yyyy年MM月dd日");
		} else if(flag == 10) {
			return date.Format("yyyy年MM月");
		} else if(flag == 11) {
			return date.Format("yyyy年");
		} else if(flag == 12) {
			return date.Format("MM-dd");
		} else if(flag == 13) {
			return date.Format("HH:mm:ss");
		} else if(flag == 14) {
			return date.Format("yyyyMMddHHmmss");
		} else if(flag == 15) {
			return date.Format("yyyyMMdd");
		} else if(flag == 16) {
			return date.Format("HH:mm");
		} else if(flag == 17) {
			return date.Format("yyyy/MM/dd HH:mm:ss EEE");
		}
	} else {
		return "";
	}
}

//重置特殊时间格式
function resetSpecialTime(date, flag) {   
	var array = date.split("T"); 
	var dateArray = array[0].split('-');  
	var year = dateArray[0];
	var month = dateArray[1];
	var day = dateArray[2];
	var timeArray = array[1].split('.')[0].split(':');
	var hh = timeArray[0]; 
	var mm = timeArray[1];
	var ss = timeArray[2]; 
	if(flag == 0) {
		return year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss; 
	}
}

//重置时间戳
function resetTimeStamp(date) {
	date = resetDate(date);
	date = new Date(date).getTime();
	return date;
}

//重置结束时间
function resetEndTime(newDate, type) {
	newDate = resetTimeStamp(newDate);
	var date;
	if(type == 0) {
		date = newDate + 24 * 60 * 60 * 1000;
	} else if(type == 1) {
		date = newDate + 24 * 60 * 60 * 1000 - 1;
	}
	return date;
}

//获取过去日期
function getAppointDate(number, type) {
	var dateArray = [],
		curreDate = new Date().getTime(),
		constant = 24 * 60 * 60 * 1000;
	for(var i = 0; i < number; i++) {
		if(type == 0) {
			var time = resetTime(curreDate - (constant * (i + 1)), 12);
			dateArray.unshift(time);
		} else if(type == 1) {
			var time = resetTime(curreDate + (constant * (i + 1)), 12);
			dateArray.push(time);
		}
	}
	return dateArray
}

//获取number天之前的日期
function getOtherDate(number, type) {
	type = true | type;
	var date = new Date();
	var timeStamp = resetTimeStamp(date);
	var constant = 24 * 60 * 60 * 1000;
	if(type) {
		date = resetTime((timeStamp - (number * constant)), 3);
	} else {
		date = resetTime((timeStamp + (number * constant)), 3);
	}
	return date;
}

//加载模板
function getPart(url, callback) {
	var timestamp = new Date().getTime();
	url = absoluteUrl + url + ".html?timestamp=" + timestamp;
	$.ajax({
		type: "GET",
		url: url,
		dataType: "html",
		contentType: "application/json",
		success: function(res) {
			callback(res);
		}
	});
}

//加载翻页
function loadPage() {
	if($(".page-box").children().length == 0) {
		getPart("parts/page", function(res) {
			$(".page-box").html(res);
			loadVue(".v-page", param);
		})
	}
}

//判断平台
function checkPlatform() {
	var localAbsoluteUrl = window.localStorage.getItem("localAbsoluteUrl");
	if(absoluteUrl == localAbsoluteUrl) {
		return true;
	}
	return false;
}

//批量删除
var idList = [];

//全选
function selectAllData() {
	if(setData.allIsActive == true) {
		setData.allIsActive = false;
		for(var i = 0; i < setData.dataList.length; i++) {
			setData.dataList[i].isActive = false;
		}
		idList = [];
	} else {
		setData.allIsActive = true;
		for(var i = 0; i < setData.dataList.length; i++) {
			if(setData.dataList[i].isActive == false) {
				setData.dataList[i].isActive = true;
				idList.push(setData.dataList[i].id);
			}
		}
	}
}

//选择单条数据
function selectOneData(obj) {
	if(obj.isActive == true) {
		obj.isActive = false;
		idList.splice($.inArray(obj.id, idList), 1);
	} else {
		obj.isActive = true;
		idList.push(obj.id);
	}
	for(var i = 0; i < setData.dataList.length; i++) {
		if(setData.dataList[i].isActive == true) {
			setData.allIsActive = true;
		} else {
			setData.allIsActive = false;
			break;
		}
	}
}

//弹框单选
var dataInfo = "";

//切换选择
function tabData(obj) {
	var dataList = setData.dataList;
	dataInfo = obj;
	resetDataInfo(dataList);
}

//重置dataInfo
function resetDataInfo(dataList) {
	for(var i = 0; i < dataList.length; i++) {
		dataList[i].isActive = false;
		if(dataInfo.id == dataList[i].id) {
			dataList[i].isActive = true;
		}
	}
}

//切换触发状态
function switchActive(obj) {
	obj.isActive = !obj.isActive;
}

//兼容checked切换选择
function switchChecked(obj) {
	obj.checked = !obj.checked;
}

//弹出框展示
function openMask(url, title, area, callback) {
	var timestamp = new Date().getTime();
	var content = absoluteUrl + url + ".html?timestamp=" + timestamp;
	layer.open({
		type: 2,
		title: [title, 'background-color:#fff;font-size:12px;'],
		shadeClose: true,
		shade: 0.3,
		shift: 1,
		area: area,
		content: [content, "no"],
		success: function(layero, index) {
			var layerDom = layer.getChildFrame('body', index);
			var layerIframe = layero.find('iframe')[0].contentWindow;
			var indexList = [];
			for(var i = 0; i < maskArray.length; i++) {
				indexList.push(maskArray[i].index);
			}
			if($.inArray(index, indexList) == -1) {
				var obj = {
					index: index,
					layerIframe: layerIframe
				}
				maskArray.push(obj);
			}
			if(callback) {
				callback(layerDom, layerIframe);
			}
		},
		end: function() {
			maskArray.pop();
		}
	});
}

//获取弹出框内容
function getMaskData(callback) {
	var index = maskArray.length - 2;
	var layerDom = layer.getChildFrame('body', maskArray[index].index);
	var layerIframe = maskArray[index].layerIframe;
	if(callback) {
		callback(layerDom, layerIframe);
	}
}

//关闭弹框
function closeMask() {
	parent.layer.close(parent.maskArray[parent.maskArray.length - 1].index);
}

//打开信息框
function openConfirm(confirmText, callback) {
	layer.confirm(confirmText, {
		title: false,
		closeBtn: false,
		btn: ['确定', '取消'],
		skin: "layui-layer-dialog-confirm"
	}, function() {
		callback();
	}, function() {

	});
}

//退出
function quit() {
	if(checkPlatform()) {
		window.localStorage.setItem("accessToken", "");
	}
	top.location.href = absoluteUrl + "login.html";
}

//添加或者修改 url中参数的值
function editUrlParam(key, value, url) {
	url = url || window.location.href;
	if(url.indexOf(key) > 0) {
		var urlValue = getUrlParam(key, url);
		if(urlValue) {
			url = url.replace(key + '=' + urlValue, key + '=' + value);
		} else {
			url = url.replace(key + '=', key + '=' + value);
		}
	} else {
		if(url.indexOf("?") > 0) {
			url = url + "&" + key + "=" + value;
		} else {
			url = url + "?" + key + "=" + value;
		}
	}
	return url;
};

//获取地址栏参数
function getUrlParam(key, url) {
	url = url || window.location.search;
	var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
	var result = url.substr(1).match(reg);
	return result ? decodeURIComponent(result[2]) : null;
}

//翻页
var pageNo = 1;

//重置翻页控件
function resetPage() {
	var pageList = [];
	var totalPage = setData.totalPage;
	var pageNo = setData.pageNo;
	for(var i = 1; i <= totalPage; i++) {
		if(pageNo < 4) {
			if(i > pageNo + 1 && i < totalPage) {
				if($.inArray("", pageList) == -1) {
					pageList.push("");
				}
			} else {
				pageList.push(i);
			}
		} else if(pageNo > totalPage - 3) {
			if(i < pageNo - 1 && i > 1) {
				if($.inArray("", pageList) == -1) {
					pageList.push("");
				}
			} else {
				pageList.push(i);
			}
		} else {
			if(i == 1 || i == totalPage || (i >= pageNo - 1 && i <= pageNo + 1)) {
				pageList.push(i);
			} else {
				if(i < pageNo - 1) {
					if($.inArray("", pageList) == -1) {
						pageList.push("");
					}
				} else if(i > pageNo + 1) {
					if($.inArray("", pageList, 3) == -1) {
						pageList.push("");
					}
				}
			}
		}
	}
	setData.pageList = pageList;
}

//检索
function search() {
	pageNo = 1;
	loadData();
}

//首页
function firstPage() {
	pageNo = 1;
	if(setData.totalPage <= 1) {
		layer.msg("页数已到最小");
		return false;
	}
	loadData();
}

//末页
function lastPage() {
	pageNo = setData.totalPage;
	if(pageNo == setData.pageNo) {
		layer.msg("页数已到最大");
		return false;
	}
	loadData();
}

//上一页
function beforePage() {
	pageNo = setData.pageNo;
	pageNo--;
	if(pageNo < 1) {
		pageNo = 1;
		layer.msg("页数已到最小");
		return false;
	}
	loadData();
}

//下一页
function nextPage() {
	pageNo = setData.pageNo;
	pageNo++;
	if(pageNo > setData.totalPage) {
		pageNo = setData.totalPage;
		layer.msg("页数已到最大");
		return false;
	}
	loadData();
}

//跳转页面
function customPage(customPageNo) {
	pageNo = customPageNo;
	loadData();
}

//重置字段排序
function resetColumnSort(columnName) {
	if(columnName != setData.columnName) {
		setData.direction = true;
	}
	setData.columnName = columnName;
	var direction = setData.direction;
	if(direction) {
		direction = false;
	} else {
		direction = true;
	}
	setData.direction = direction;
	search();
}

//时间控件
function setTime(param) {
	var options = {
		trigger: 'click',
	}
	$.extend(options, param);
	layui.use('laydate', function() {
		var laydate = layui.laydate;
		lay(options.elem).each(function() {
			options.elem = this;
			laydate.render(options);
		});
	});
}

//导出
function exportExcel(dom, columns, fileName) {
	dom.table2excel({
		exclude: ".noExl",
		name: "Excel Document Name",
		columns: columns,
		filename: fileName,
		exclude_img: true,
		exclude_links: true,
		exclude_inputs: true
	});
}

//关闭菜单栏
function closeNav(navs) {
	var dataId = self.frameElement.getAttribute('data-id');
	for(var i = 0; i < navs.length; i++) {
		var layId = navs.eq(i).attr("lay-id");
		if(dataId == layId) {
			var closeDom = navs.eq(i).find(".layui-tab-close");
			closeDom.click();
			break;
		}
	}
}

//关闭全部菜单
function closeAllNav() {
	$(".layui-nav-tree li").removeClass("layui-nav-itemed");
	$("layui-nav-tree .layui-nav-child").hide();
}

//打开菜单栏
function tabNav(id) {
	var leftNavs = $(".nav-box", top.document).find("dd a");
	var rightNavs = $("#rightNav", top.document).find("li");
	var leftNavIds = [];
	for(var i = 0; i < leftNavs.length; i++) {
		var leftNavId = leftNavs.eq(i).attr("data-id");
		leftNavIds.push(leftNavId);
	}
	if($.inArray(id, leftNavIds) == -1) {
		layer.msg("关联功能权限未打开，此功能无法操作，请联系管理员");
	} else {
		for(var i = 0; i < leftNavs.length; i++) {
			var leftNavId = leftNavs.eq(i).attr("data-id");
			if(id == leftNavId) {
				leftNavs[i].click();
			}
		}
	}
	closeNav(rightNavs);
}

//获取一个月多少天
function getCountDays() {
	var curDate = new Date();
	var curMonth = curDate.getMonth();
	curDate.setMonth(curMonth + 1);
	curDate.setDate(0);
	return curDate.getDate();
}

//格式化空图
function resetImage() {
	for(var i = 0; i < $("img").length; i++) {
		var imgDom = $("img").eq(i);
		if(imgDom.attr("src") == "../img/common/no-img.png") {
			imgDom.attr("src", "");
		}
	}
}

//删除内容
function delContent(index) {
	var newContentList = [];
	var contentList = setData.contentList;
	for(var i = 0; i < contentList.length; i++) {
		newContentList.push(contentList[i]);
	}
	newContentList.splice(index--, 1);
	setData.contentList = newContentList;
}

//排序
function resetSort(property, type) {
	type = false | type;
	return function(a, b) {
		if(type) {
			//升序
			return a[property] - b[property];
		} else {
			//降序
			return b[property] - a[property];
		}
	}
}

//列表生成二维码
function makeQRCode(obj) {
	var dom = $("#QRCode" + obj.id);
	dom.empty();
	dom.qrcode({
		render: "canvas",
		text: obj.QRCodeText,
		width: "100", //二维码的宽度
		height: "100", //二维码的高度
		background: "#ffffff", //二维码的后景色
		foreground: "#000000", //二维码的前景色
	});
}

//下载二维码
function downloadQRCode(ev) {
	var ev = event.currentTarget;
	var canvas = $(ev).find("canvas").get(0);
	var url = canvas.toDataURL('image/png');
	$(ev).attr('href', url);
	return false;
}

//无缝滚动
function seamlessRolling(id, milliseconds) {
	var dom = $("#" + id);
	var height = dom.outerHeight(true);
	var childHeight = dom.children().outerHeight(true);
	var H = Math.ceil(dom.children().children().outerHeight(true));
	if(height < childHeight) {
		clearInterval(window[id]);
		window[id] = setInterval(function() {
			var top = Math.ceil(dom.scrollTop());
			if(top >= (childHeight - height)) {
				top = 0;
				dom.scrollTop(top);
			}
			dom.stop().animate({
				scrollTop: top + H
			}, 500);
		}, milliseconds);
	}
}

//点击滚动
function clickRolling(id, type) {
	var dom = $("#" + id);
	var height = dom.outerHeight(true);
	var childHeight = dom.children().outerHeight(true);
	var H = Math.ceil(dom.children().children().outerHeight(true));
	var top = Math.ceil(dom.scrollTop());
	if(height < childHeight) {
		if(type == 0) {
			dom.stop().animate({
				scrollTop: top + H
			}, 500);
		} else if(type == 1) {
			dom.stop().animate({
				scrollTop: top - H
			}, 500);
		}
	}
}

//鼠标略过滚动停止
function stopScroll(timer) {
	clearInterval(eval(timer));
}

//根据索引获取数组
function getIndexArray(dataList, index, slotType) {
	var resArray = [];
	for(var i = 0; i < dataList.length; i++) {
		if(slotType == true) {
			//正序
			resArray.push(dataList[i][index]);
		} else {
			//倒序
			resArray.unshift(dataList[i][index]);
		}
	}
	return resArray;
}

//获取总费用
function getTotalFee(dataList) {
	var feeList = ["物业费", "水费", "电费", "车位管理费", "固定停车费", "临时停车费", "生活垃圾处理费", "储藏间管理费", "房租", "供暖费", "其他"];
	var feeName = [];
	var totalValue = [];
	for(var i = 0; i < feeList.length; i++) {
		for(var j = 0; j < dataList.length; j++) {
			if(dataList[j].feeName.indexOf(feeList[i]) > -1) {
				if($.inArray(feeList[i], feeName) == -1) {
					feeName.push(feeList[i]);
				}
			}
		}
	}
	for(var i = 0; i < feeName.length; i++) {
		var totalFee = 0;
		for(var j = 0; j < dataList.length; j++) {
			if(dataList[j].feeName.indexOf(feeName[i]) > -1) {
				totalFee += dataList[j].totalValue;
			}
		}
		totalValue.push(parseFloat(totalFee).toFixed(2));
	}

	var res = {
		feeName: feeName,
		totalValue: totalValue
	}
	return res;
}

//获取JSON
function getJson(part, callback) {
	var timestamp = new Date().getTime();
	var requestUrl = absoluteUrl + part + ".json?timestamp=" + timestamp;
	$.getJSON(requestUrl, function(res) {
		callback(res);
	})
}

//数字位数不够补零
function formatZero(num, len) {
	if(String(num).length > len) return num;
	return(Array(len).join(0) + num).slice(-len);
}

//定时任务
var timeTaskIndex = 0;

function timeTask(milliseconds, callback) {
	timeTaskIndex++;
	window["timeTask" + timeTaskIndex] = setInterval(function() {
		callback();
	}, milliseconds);
}

//正则验证
function checkRegular() {
	//	必填
	for(var i = 0; i < $(".required").length; i++) {
		var dom = $(".required").eq(i);
		if(!dom.val()) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "为必填项 请核对");
			return false;
		}
	}

	//	图片必填
	for(var i = 0; i < $(".required-img").length; i++) {
		var dom = $(".required-img").eq(i);
		var src = dom.attr("src");
		if(!src || src == "../img/common/no-img.png") {
			var required = dom.parent().parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "为必填项 请核对");
			return false;
		}
	}

	//	长度不超过15
	for(var i = 0; i < $(".length-15").length; i++) {
		var dom = $(".length-15").eq(i);
		var value = dom.val();
		if(value && value.length > 15) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "长度不能超过15");
			return false;
		}
	}

	//	长度不超过6
	for(var i = 0; i < $(".length-6").length; i++) {
		var dom = $(".length-6").eq(i);
		var value = dom.val();
		if(value && value.length > 6) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "长度不能超过6");
			return false;
		}
	}

	//	长度不超过30
	for(var i = 0; i < $(".length-30").length; i++) {
		var dom = $(".length-30").eq(i);
		var value = dom.val();
		if(value && value.length > 30) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "长度不能超过30");
			return false;
		}
	}

	//	长度不超过200
	for(var i = 0; i < $(".length-200").length; i++) {
		var dom = $(".length-200").eq(i);
		var value = dom.val();
		if(value && value.length > 200) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "长度不能超过200");
			return false;
		}
	}

	//	长度为6位
	for(var i = 0; i < $(".length-equals-6").length; i++) {
		var dom = $(".length-equals-6").eq(i);
		var value = dom.val();
		if(value && value.length != 6) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "长度为6位 请核对");
			return false;
		}
	}

	//数字
	for(var i = 0; i < $(".regular-number").length; i++) {
		var dom = $(".regular-number").eq(i);
		var value = dom.val();
		if(value && !regular_number.test(value)) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "请输入数字");
			return false;
		}
	}

	//整数
	for(var i = 0; i < $(".regular-int").length; i++) {
		var dom = $(".regular-int").eq(i);
		var value = dom.val();
		if(value && !regular_int.test(value)) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "请输入整数");
			return false;
		}
	}

	//正数
	for(var i = 0; i < $(".regular-positive-number").length; i++) {
		var dom = $(".regular-positive-number").eq(i);
		var value = dom.val();
		if(value && !regular_positive_number.test(value)) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "请输入正数");
			return false;
		}
	}

	//正整数
	for(var i = 0; i < $(".regular-positive-int").length; i++) {
		var dom = $(".regular-positive-int").eq(i);
		var value = dom.val();
		if(value && !regular_positive_int.test(value)) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "请输入正整数");
			return false;
		}
	}

	//手机号
	for(var i = 0; i < $(".regular-telephone").length; i++) {
		var dom = $(".regular-telephone").eq(i);
		var value = dom.val();
		if(value && !regular_telephone.test(value)) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "请输入正确的手机号");
			return false;
		}
	}

	//密码
	for(var i = 0; i < $(".regular-password").length; i++) {
		var dom = $(".regular-password").eq(i);
		var value = dom.val();
		if(value && !regular_password.test(value)) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "格式为4-16位数字或字母，区分大小写");
			return false;
		}
	}

	//邮箱
	for(var i = 0; i < $(".regular-email").length; i++) {
		var dom = $(".regular-email").eq(i);
		var value = dom.val();
		if(value && !regular_email.test(value)) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "请输入正确的邮箱");
			return false;
		}
	}

	//密码
	for(var i = 0; i < $(".regular-id-number").length; i++) {
		var dom = $(".regular-id-number").eq(i);
		var value = dom.val();
		if(value && !regular_id_number.test(value)) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "请输入正确的身份证号");
			return false;
		}
	}

	//密码
	for(var i = 0; i < $(".regular-room-address").length; i++) {
		var dom = $(".regular-room-address").eq(i);
		var value = dom.val();
		if(value && !regular_room_address.test(value)) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "请输入正确的房屋地址");
			return false;
		}
	}

	//码
	for(var i = 0; i < $(".regular-code").length; i++) {
		var dom = $(".regular-code").eq(i);
		var value = dom.val();
		if(value && !regular_code.test(value)) {
			var required = dom.parent().siblings(".mask-list-name").find(".text").text();
			layer.msg(required + "请输入正确的编码");
			return false;
		}
	}
	return true;
}