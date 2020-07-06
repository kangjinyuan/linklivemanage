$(function() {
	param.communityName = "";
	param.currentTime = "";
	param.menuSwitch = true;
	loadVue(".v-dom", param);
	loadData();
	loadTime();
	resetSize();
})

window.onresize = function() {
	resetSize();
}

function resetSize() {
	var windowWidth = $(window).width();
	var windowHeight = $(window).height();
	var menuSwitch = setData.menuSwitch;
	if(menuSwitch) {
		$(".kjy-left-box").width(200);
		$(".kjy-right-box").width(windowWidth - 200);
	} else {
		$(".kjy-left-box").width(80);
		$(".kjy-right-box").width(windowWidth - 80);
	}
}

//加载菜单数据
function loadData() {
	var timestamp = new Date().getTime();
	getJson("json/service", function(res) {
		res.sort(resetSort("sort", true));
		setData.dataList = res;
		setData.path = absoluteUrl + "index.html?timestamp=" + timestamp;
		nextTick(function() {
			setNav();
		})
	});
}

//加载当前时间
function loadTime() {
	var loadTime = setInterval(function() {
		if(checkPlatform()) {
			var date = new Date();
			setData.currentTime = resetTime(date, 0);
		} else {
			quit();
		}
	}, 1000);
}

//显示子菜单
function showChildMenu(event) {
	var ev = event.currentTarget;
	closeAllNav();
	$(ev).siblings("a").eq(0).click();
}

//关闭展开菜单
function menuSwitch(t) {
	var menuSwitch = setData.menuSwitch;
	setData.menuSwitch = !menuSwitch;
	closeAllNav();
	resetSize();
}