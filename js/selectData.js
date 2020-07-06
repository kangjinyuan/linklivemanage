var selectDataList = [];

function selectData(obj) {
	var dataList = setData.dataList;
	if(obj.isActive == true) {
		for(var i = 0; i < selectDataList.length; i++) {
			if(obj.id == selectDataList[i].id) {
				selectDataList.splice(i--, 1);
			}
		}
	} else {
		selectDataList.push(obj);
	}
	resetData(dataList)
}

function selectAllData() {
	var dataList = setData.dataList;
	if(setData.allIsActive == true) {
		for(var i = 0; i < dataList.length; i++) {
			for(var j = 0; j < selectDataList.length; j++) {
				if(dataList[i].id == selectDataList[j].id) {
					selectDataList.splice(j--, 1);
				}
			}
		}
	} else {
		for(var i = 0; i < dataList.length; i++) {
			if(dataList[i].isActive == false) {
				selectDataList.push(dataList[i]);
			}
		}
	}
	resetData(dataList)
}

function resetData(dataList) {
	for(var i = 0; i < dataList.length; i++) {
		dataList[i].isActive = false;
		for(var j = 0; j < selectDataList.length; j++) {
			if(selectDataList[j].id == dataList[i].id) {
				dataList[i].isActive = true;
			}
		}
	}
	for(var i = 0; i < dataList.length; i++) {
		if(dataList[i].isActive == true) {
			setData.allIsActive = true;
		} else {
			setData.allIsActive = false;
			break;
		}
	}
}