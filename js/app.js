$(function() {
	//	返回强制刷新
	judePhone(function() {}, function() {
		var isPageHide = false;
		window.addEventListener('pageshow', function() {
			if(isPageHide) {
				window.location.reload();
			}
		});
		window.addEventListener('pagehide', function() {
			isPageHide = true;
		});
	})
});

//登录返回的accessToken令牌
var accessToken = window.localStorage.getItem("accessToken");

//正则表达式
var regular_fee = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
var regular_phone = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;

//刷新页面
function reloadPage() {
	window.location.reload();
}

//返回上一级页面
function goBack(index) {
	window.history.go(index);
}

var setData;

//初始化vue
var param = {
	dataList: [],
	allIsActive: false,
	totalPage: 0,
	pageSize: 0,
	currentPage: 0,
	count: 0,
	dataLength: 0
}

function nextTick(callback) {
	Vue.nextTick(function() {
		callback();
	});
}

//格式化时间
Date.prototype.Format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

//判断时间是否为字符串
function judeDate(date) {
	if(typeof(date) == "string") {
		date = date.substring(0, 19);
		date = date.replace(/-/g, '/');
	}
	date = new Date(date);
	return date;
}

//转换yy-mm-dd hh-mm-ss，0精确到秒，1精确到分，2精确到时，3精确到日，4精确到月，5精确到年
function resetTime(date, flag) {
	if(date) {
		date = judeDate(date);
		if(flag == 0) {
			return date.Format("yyyy-MM-dd hh:mm:ss");
		} else if(flag == 1) {
			return date.Format("yyyy-MM-dd hh:mm");
		} else if(flag == 2) {
			return date.Format("yyyy-MM-dd hh");
		} else if(flag == 3) {
			return date.Format("yyyy-MM-dd");
		} else if(flag == 4) {
			return date.Format("yyyy-MM");
		} else if(flag == 5) {
			return date.Format("yyyy");
		} else if(flag == 6) {
			return date.Format("yyyy年MM月dd日 hh时mm分ss");
		} else if(flag == 7) {
			return date.Format("yyyy年MM月dd日 hh时mm分");
		} else if(flag == 8) {
			return date.Format("yyyy年MM月dd日 hh时");
		} else if(flag == 9) {
			return date.Format("yyyy年MM月dd日");
		} else if(flag == 10) {
			return date.Format("yyyy年MM月");
		} else if(flag == 11) {
			return date.Format("yyyy年");
		}
	} else {
		return "";
	}
}

//延长XX分钟
function exTendTime(date, slot) {
	date = judeDate(date);
	var timeSlot = resetTime(date.setMinutes(date.getMinutes() + slot), 0);
	return timeSlot;
}

//获取时间段
function getTimeSlot(date, callback) {
	//指定日期和时间
	var EndTime = judeDate(date);
	//当前系统时间
	var NowTime = new Date();
	var timeSlot = EndTime.getTime() - NowTime.getTime();
	var d = Math.floor(timeSlot / (1000 * 60 * 60 * 24));
	var h = Math.floor(timeSlot / (1000 * 60 * 60)) % 24,
		hh = Math.floor(timeSlot / (1000 * 60 * 60)) % 24;
	var m = Math.floor(timeSlot / (1000 * 60)) % 60,
		mm = Math.floor(timeSlot / (1000 * 60)) % 60;
	var s = Math.floor(timeSlot / 1000) % 60,
		ss = Math.floor(timeSlot / 1000) % 60;
	if(h < 10) {
		var hh = "0" + h;
	}
	if(m < 10) {
		var mm = "0" + m;
	}
	if(s < 10) {
		var ss = "0" + s;
	}
	if(d >= 0) {
		if(d > 0) {
			timeSlot = d + "天" + hh + ":" + mm + ":" + ss;
		} else if(d == 0) {
			if(h > 0) {
				timeSlot = hh + ":" + mm + ":" + ss;
			} else if(h <= 0) {
				timeSlot = mm + ":" + ss;
				if(m == 0 && s == 0) {
					if(callback) {
						callback();
					}
				}
			}
		}
		return timeSlot;
	}
}

//时间段倒计时
function loadTimeSlot(date, callback) {
	var slotTimer = setInterval(function() {
		if(callback) {
			setData.timeSlot = getTimeSlot(date, callback);
		} else {
			setData.timeSlot = getTimeSlot(date);
		}
	}, 1000);
}

function loadVue(param) {
	setData = new Vue({
		el: '.VDOM',
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

//公共请求方法
//method 请求方式
//rquestUrl 请求地址
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
	if(method == "POST") {
		param.accessToken = accessToken;
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
		url: url + requestUrl + "?timestamp=" + timestamp,
		contentType: "application/json;charset=UTF-8",
		data: param,
		dataType: 'json',
		success: function(res) {
			if(res.code == "0000") {
				okCallback(res);
			} else if(res.code == "0007" || res.code == "0006") {
				window.localStorage.setItem("accessToken", "");
				layer.msg("第三方授权过期，请关闭页面，重新进入页面授权");
			} else if(res.code == "0008") {
				layer.msg("服务器内部错误");
			} else if(res.code == "0400") {
				layer.msg("服务达到上限，如想创建请联系闪向");
			} else if(res.code == "0501") {
				layer.msg("第三方关联楼宇单元错误，请联系闪向");
			} else {
				noCallback(res);
			}
			if(isPage == true) {
				setData.dataLength = res.data.length;
				setData.totalPage = res.totalPage;
				setData.pageSize = res.pageSize;
				setData.currentPage = res.currentPage;
				setData.count = res.count;
			}
			if($(".VDOM").length > 0) {
				nextTick(function() {
					if(window.loadMore) {
						loadMore();
					} else if(window.banner) {
						banner();
					}
				});
			}
			if(showLoading == true) {
				layer.closeAll('loading');
			}
		},
		error: function(res) {
			if(res.status == '401' || res.status == '402' || res.status == '403' || res.status == '404' || res.status == '405' || res.status == '407' || res.status == '413' || res.status == '414' || res.status == '415' || res.status == '500' || res.status == '502' || res.status == '503' || res.status == '504' || res.status == '505') {
				window.location.href = host + '/linklive/part/err.html';
			}
		}
	});
}

//加载全屏模板
function loadPart(url, dom, callback) {
	var timestamp = new Date().getTime();
	$.ajax({
		type: "GET",
		url: url + '.html?timestamp=' + timestamp,
		dataType: "html",
		contentType: "application/json",
		success: function(res) {
			$(dom).append(res);
			callback(res);
		}
	});
}

//选择数据
var dataList = [];

function setTotalFee(dataList) {
	if(dataList.length > 0) {
		setData.total_count = dataList.length;
		var total_fee = 0;
		for(var i = 0; i < dataList.length; i++) {
			total_fee += parseFloat(dataList[i].fee);
		}
		setData.total_fee = total_fee.toFixed(2);
	} else {
		setData.total_count = "0";
		setData.total_fee = "0";
	}
}

//全选
function selectAllData() {
	if(setData.allIsActive == true) {
		setData.allIsActive = false;
		for(var i = 0; i < setData.dataList.length; i++) {
			setData.dataList[i].isActive = false;
		}
		dataList = [];
	} else {
		setData.allIsActive = true;
		for(var i = 0; i < setData.dataList.length; i++) {
			if(setData.dataList[i].isActive == false) {
				setData.dataList[i].isActive = true;
				dataList.push(setData.dataList[i]);
			}
		}
	}
	if(setData.total_fee) {
		setTotalFee(dataList);
	}
}

//选择单条数据
function selectOneData(obj) {
	if(obj.isActive == true) {
		obj.isActive = false;
		dataList.splice($.inArray(obj, dataList), 1);
	} else {
		obj.isActive = true;
		dataList.push(obj);
	}
	for(var i = 0; i < setData.dataList.length; i++) {
		if(setData.dataList[i].isActive == true) {
			setData.allIsActive = true;
		} else {
			setData.allIsActive = false;
			break;
		}

	}
	if(setData.total_fee) {
		setTotalFee(dataList);
	}
}

//删除数据
function delData(confirmtext, callback) {
	if(dataList.length == 0) {
		layer.msg("请选择要删除的数据");
	} else {
		layer.confirm(confirmtext, {
			btn: ['确定', '取消']
		}, function() {
			var idList = new Array();
			for(var i = 0; i < dataList.length; i++) {
				idList.push(dataList[i].id);
			}
			var param = {
				idList: idList
			}
			callback(param);
		}, function() {

		});
	}
}

//删除数据
function delOneData(id, confirmtext, callback) {
	layer.confirm(confirmtext, {
		btn: ['确定', '取消']
	}, function() {
		var idList = new Array();
		idList.push(id);
		var param = {
			idList: idList
		}
		callback(param);
	}, function() {

	});
}

//获取地址栏参数
function getQueryString(key) {
	var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
	var result = window.location.search.substr(1).match(reg);
	return result ? decodeURIComponent(result[2]) : null;
}

//翻页
var page = 1;

function scrollpage(dom, callback) {
	$(window).scroll(function() {
		var dot = 1;
		if(dot + $(window).scrollTop() > (dom.height() - $(window).height())) {
			if(page == setData.currentPage) {
				page++;
				if(page > setData.totalPage) {
					page = setData.totalPage;
					return false;
				}
				callback();
			}
		}
	});
}

function getScrollTop() {
	$(window).scroll(function() {
		if($(window).scrollTop() != 0) {
			sessionStorage.setItem("scrollTop", $(window).scrollTop());
		}
	});
}

function setScrollTop() {
	var scrollTop = sessionStorage.getItem("scrollTop");
	setTimeout(function() {
		$(window).scrollTop(scrollTop);
	}, 0);
}

//时间控件
function setTime(dom) {
	layui.use('laydate', function() {
		var laydate = layui.laydate;
		laydate.render({
			elem: dom
		});
	});
}

//格式化手机号
function resetTelephone(telephone) {
	var telephone = telephone.substring(0, 3) + "****" + telephone.substring(7, 11);
	return telephone;
}

//发送验证码
var tokentimer
var tt = 60;

function getTokentime(t) {
	var tokentimer = setInterval(function() {
		tt--;
		if(tt == 0) {
			tt = 60;
			$(t).html("重新发送");
			clearInterval(tokentimer);
		} else {
			$(t).html(tt + "S重新发送");
		}
	}, 1000);
}

//车牌临时缴费
var carNo = "";

// 开启新能源
function setNewEnergy() {
	if(carNo.length < 7) {
		layer.msg("请完善基础车牌号")
		setData.newEnergy = 1;
	} else {
		setData.newEnergy = 0;
	}
}

// 设置车牌数组
function setCarNoArr(carNo, callback) {
	var oldArr = carNo.split("");
	var carNoArr = setData.carNoArr;
	for(var i = 0; i < carNoArr.length; i++) {
		carNoArr[i] = "";
		if(oldArr[i]) {
			carNoArr[i] = oldArr[i];
		}
	}
	setData.carNoArr = carNoArr;
	callback();
}

// 显示省级键盘
function showProvinces() {
	$(".key-province-box").show();
	$(".key-num-box").hide();
	setData.selected = 0;
}

// 显示车牌键盘
function showkeyNums(index, flag) {
	var carNoArr = setData.carNoArr;
	if(flag == 0) {
		setData.setKeyNumFlag = 0;
	} else {
		setData.setKeyNumFlag = 1;
	}
	if(carNoArr[0] == "") {
		$(".key-province-box").show();
		$(".key-num-box").hide();
		layer.msg("请先输入省");
		setData.selected = 0;
	} else {
		$(".key-province-box").hide();
		$(".key-num-box").show();
		setData.selected = index;
	}
}

// 关闭键盘
function closekey() {
	$(".key-province-box").hide();
	$(".key-num-box").hide();
	$(".car-number-text-box").find("span").removeClass("selected");
}

// 选择省级键盘
function selectProvinces(province) {
	var carNoArr = setData.carNoArr;
	carNoArr[0] = province;
	carNo = "";
	for(var i = 0; i < carNoArr.length; i++) {
		carNo += carNoArr[i];
	}
	$(".key-province-box").hide();
	$(".key-num-box").show();
	setCarNoArr(carNo, function() {
		showkeyNums(carNo.length, 0);
	});
}

// 选择数字键盘
function selectKeyNums(keyNum) {
	var newEnergy = setData.newEnergy;
	var setKeyNumFlag = setData.setKeyNumFlag;
	if(newEnergy == 0) {
		if(carNo.length >= 8 && setKeyNumFlag == 0) {
			layer.msg("新能源车牌号不能超过8位");
			return false;
		}
	} else {
		if(carNo.length >= 7 && setKeyNumFlag == 0) {
			layer.msg("普通车牌号不能超过7位");
			return false;
		}
	}
	if(setKeyNumFlag == 0) {
		carNo = carNo + keyNum;
	} else {
		var carNoArr = carNo.split("");
		carNoArr[setData.selected] = keyNum;
		carNo = carNoArr.join("");
	}
	setCarNoArr(carNo, function() {
		showkeyNums(carNo.length, 0);
	});
}

// 删除车牌号
function delCarNo() {
	var s = carNo.split('');
	if(s.slice(0, -1).length == 0) {
		$(".key-province-box").show();
		$(".key-num-box").hide();
	}
	if(carNo.length == 8 || carNo.length == 7) {
		setData.newEnergy = 1
	}
	s = s.join('').slice(0, -1);
	var selected = carNo.length - 1;
	if(selected == 0) {
		selected = 1;
	}
	carNo = s;
	setCarNoArr(carNo, function() {
		showkeyNums(selected, 0);
	});
}

//判断客户端（微信，支付宝，浏览器）
function judeClient(wxcallback, alipaycallback, viewcallback) {
	var ua = window.navigator.userAgent.toLowerCase();
	if(ua.match(/MicroMessenger/i) == 'micromessenger') {
		wxcallback();
	} else if(ua.match(/Alipay/i) == "alipay") {
		alipaycallback()
	} else {
		viewcallback();
	}
}

//判断安卓或者IOS
function judePhone(androidCallback, iosCallback) {
	if(/(Android)/i.test(navigator.userAgent)) {
		//判断Android
		androidCallback();
	} else if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
		//判断iPhone|iPad|iPod|iOS
		iosCallback();
	} else {
		if(navigator.userAgent.indexOf("Window") > 0) {
			androidCallback();
		} else if(navigator.userAgent.indexOf("Mac OS X") > 0) {
			iosCallback();
		}
	};
}

//下载app或者跳转app
function downloadApp(dom) {
	judePhone(function() {
		var AndroidUrl = "http://a.app.qq.com/o/simple.jsp?pkgname=com.zealens.storytree";
		dom.attr("href", AndroidUrl);
	}, function() {
		var iosUrl = "https://itunes.apple.com/cn/app/";
		var iosAppid = "id1411250204";
		var meta = "<meta name='apple-itunes-app' content='app-id=" + iosappid + "'>";
		dom.attr("href", iosUrl + iosAppid);
	})
}

//获取accessCode
var accessCode = "";

function getAccessCode(pageUrl) {
	judeClient(function() {
		var appid = "wx80981a4c40d71d45";
		//		location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + encodeURIComponent(pageUrl) + '&response_type=code&scope=snsapi_base&state=STATE%23wechat_redirect&connect_redirect=1#wechat_redirect';
		//		location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + encodeURIComponent(pageUrl) + '&response_type=code&scope=snsapi_userinfo&state=STATE%23wechat_redirect&connect_redirect=1#wechat_redirect';
		location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + encodeURIComponent(pageUrl) + '&response_type=code&scope=snsapi_userinfo&state=STATE%23wechat_redirect&connect_redirect=1#wechat_redirect';
	}, function() {
		var appid = "2018101661691470";
		location.href = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=' + appid + "&scope=auth_user&redirect_uri=" + encodeURIComponent(pageUrl);
	}, function() {
		layer.msg("请在微信公众号（邻客社区服务）中缴费");
	})
}

//三方登录
function thirdPartyLogin() {
	var param = {}
	judeClient(function() {
		param = {
			platform: "wx_public",
			accessCode: accessCode
		}
	}, function() {
		param = {
			platform: "alipay",
			accessCode: accessCode
		}
	}, function() {

	})
	request("POST", "/account/mobile/thirdPartyLogin.do", param, true, function(res) {
		window.localStorage.setItem("accessToken", res.accessToken);
		layer.msg("第三方授权成功");
	}, function(res) {
		if(res.code == "0201") {
			layer.msg("请先关注微信公众号（邻客社区服务）", {
				time: 2000
			}, function() {
				window.location.href = "follow_linklive.html";
			});
		} else {
			goBack(-1);
		}
	})
}

//判断三方登录
function judeThirdPartyLogin(callback) {
	judeClient(function() {
		accessCode = getQueryString("code");
	}, function() {
		accessCode = getQueryString("auth_code");
	}, function() {
		accessCode = "";
	})
	if(accessToken) {
		callback();
	} else {
		if(accessCode) {
			thirdPartyLogin();
		} else {
			var pageUrl = location.href;
			getAccessCode(pageUrl);
		}
	}
}

//团购
//展示模块
function showDom(dom) {
	if($("." + dom).css("display") == "block") {
		$("." + dom).hide();
	} else {
		$("." + dom).fadeIn(200);
	}
}

//放大图片
function previewImage(src) {
	$(".full-img-box img").attr("src", "");
	showDom("full-img-box");
	$(".full-img-box img").attr("src", src);
}

//选择规格
function selectAttribute(event) {
	var ev = event.currentTarget;
	var skuList = setData.skuList;
	var attributeList = setData.attributeList;
	var commodityInfo = setData.commodityInfo;
	skuInfo = "";
	setData.skuImage = imgUrl + commodityInfo.image0;
	setData.skuStock = commodityInfo.totalStock;
	setData.skuPrice = commodityInfo.finalPrice;
	if($(ev).hasClass("selected") == true) {
		$(ev).removeClass("selected").siblings().removeClass("selected");
	} else {
		$(ev).addClass("selected").siblings().removeClass("selected");
	}
	var code = "";
	var combinationed = [];
	var selectedAttribute = $(".rule-select-box .selected");
	for(var i = 0; i < selectedAttribute.length; i++) {
		code += selectedAttribute.eq(i).attr("data-id") + selectedAttribute.eq(i).attr("data-index") + " ";
		combinationed.push(selectedAttribute.eq(i).text());
	}
	setData.combinationed = combinationed;
	if(combinationed.length == attributeList.length) {
		setData.skuImage = "";
		setData.skuPrice = "0.00";
		setData.skuStock = "0";
		for(var i = 0; i < skuList.length; i++) {
			if(code.substring(0, code.length - 1) == skuList[i].code) {
				setData.skuImage = skuList[i].image;
				setData.skuPrice = skuList[i].price;
				setData.skuStock = skuList[i].stock;
				skuInfo = skuList[i];
				break;
			}
		}
	}
}

//商品数量加
function addOrReduce(flag) {
	var quantity = setData.quantity;
	if(flag == 0) {
		quantity++;
	} else {
		quantity--;
		if(quantity <= 0) {
			quantity = 1;
		}
	}
	setData.quantity = quantity;
}

//确认收货
function confirmOrder(id) {
	layer.confirm("是否确认收货？", {
		btn: ['确定', '取消']
	}, function() {
		var param = {
			id: id
		}
		request('POST', '/shop/order/confirmOrder.do', param, true, function(res) {
			setData.state = "3";
			jsToApp("4", setData.state);
			var data = {
				state: setData.state
			}
			loadData(data);
			layer.closeAll('dialog');
		}, function(res) {
			layer.msg("确认收货失败，请检查网络或重试");
		})
	}, function() {

	});
}

//取消订单
function cancelOrder(id) {
	layer.confirm("是否取消订单？", {
		btn: ['确定', '取消']
	}, function() {
		var param = {
			id: id
		}
		request('POST', '/shop/order/cancelOrder.do', param, true, function(res) {
			setData.state = "5";
			jsToApp("4", setData.state);
			var data = {
				state: setData.state
			}
			loadData(data);
			layer.closeAll('dialog');
		}, function(res) {
			layer.msg("取消订单失败，请检查网络或重试");
		})
	}, function() {

	});
}

//当前字数 0/120
function setNum(t) {
	var value = $(t).val();
	setData.wordNumber = value.length;
}

//订单页面跳转
function orderSkipPage(flag, obj) {
	var id = obj.id;
	var orderInfo = encodeURIComponent(JSON.stringify(obj));
	if(flag == 0) {
		window.location.href = "orderInfo.html?id=" + id;
	} else if(flag == 1) {
		window.location.href = "setComment.html?orderInfo=" + orderInfo;
	} else if(flag == 2) {
		window.location.href = "pay_way.html?orderInfo=" + orderInfo;
	}
}

//js给app传递数据
function jsToApp(flag, data, callback) {
	var param = {
		flag: flag,
		data: data
	}
	param = JSON.stringify(param);
	judePhone(function() {
		Android.jsToApp(param);
	}, function() {
		window.webkit.messageHandlers.jsToApp.postMessage(param);
	})
	if(callback) {
		callback();
	}
}

//获取app给js传递参数
function getAppData(res) {
	var res = JSON.stringify(res);
	res = JSON.parse(res);
	var flag = res.flag;
	var data = res.data;
	if($.isPlainObject(data)) {
		if(data.accessToken) {
			window.localStorage.setItem("accessToken", data.accessToken);
		}
	}
	if(flag == "0") {
		loadData(data);
	} else if(flag == "1") {
		if(data == "0") {
			showDom("share-box");
		} else if(data == "1") {
			add("");
		} else if(data == "2") {
			del();
		}
	} else if(flag == "2") {
		window.localStorage.setItem("accessToken", data);
		setOrder();
	} else if(flag == "3") {
		payResult(data);
	}
}

//排序
function resetSort(property, flag) {
	return function(a, b) {
		if(flag == 0) {
			// 越小越靠前
			return a[property] - b[property];
		} else if(flag == 1) {
			// 越大越靠前
			return b[property] - a[property];
		}
	}
}