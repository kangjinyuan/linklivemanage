function setNav() {
	layui.use('element', function() {
		var element = layui.element;
		var timestamp = new Date().getTime();
		$("#rightNav li").eq(0).children("i").css("display", "none");
		var navs = new Array();
		$(".layui-nav-child li").on("click", "a", function() {
			var id = $(this).attr("data-id");
			var path = $(this).attr("data-path");
			if($.inArray(id, navs) == -1) {
				if(path == "") {
					layer.msg('此功能未开放');
					return false;
				}
				navs.push(id);
				//新增一个Tab项
				path = absoluteUrl + path + ".html?timestamp=" + timestamp;
				element.tabAdd('kjy', {
					title: $(this).text(),
					content: "<iframe data-id='" + id + "' src='" + path + "' frameborder='0' marginheight='0' marginwidth='0' scrolling='yes' width='100%'></iframe>",
					id: id
				})
			}
			element.tabChange("kjy", id);
		})
		$(".layui-tab").on("click", function(e) {
			var clickDom = $(e.target);
			var id = clickDom.parent().attr("lay-id");
			if(clickDom.is(".layui-tab-close")) {
				navs.splice($.inArray(id, navs), 1);
			}
		})
		$(".layui-nav .layui-nav-item").hover(function() {
			$(this).find("i").addClass($(this).attr("data-select-icon"));
		}, function() {
			$(this).find("i").removeClass($(this).attr("data-select-icon"));
		})
	});
}