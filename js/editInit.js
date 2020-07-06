function setLayui(dom, tool, callback) {
	layui.use('layedit', function() {
		var layedit = layui.layedit;
		layedit.build(dom, {
			tool: tool
		}); //建立编辑器
		$(".layui-layedit-tool .layedit-tool-image").attr("id", "layuiImg");
		$(".layui-layedit-tool .layedit-tool-image").addClass("upload-img");
		$(".layui-layedit-tool .layedit-tool-image input").remove();
	});
	if(callback){
		callback();
	}
}