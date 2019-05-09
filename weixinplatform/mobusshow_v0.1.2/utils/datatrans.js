function ab2str(buf) {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
}

// 字符串转为ArrayBuffer对象，参数为字符串
function str2ab(str) {
	var buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
	var bufView = new Uint16Array(buf);
	for (var i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}


function inArray(arr, key, val) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i][key] === val) {
			return i;
		}
	}
	return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
	var hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function(bit) {
			return ('00' + bit.toString(16)).slice(-2)
		}
	)
	return hexArr.join(';');
}


// concatTypeArray(Uint8Array, Uint8Array.of(1, 2), Uint8Array.of(3, 4))
// Uint8Array [1, 2, 3, 4]
//typearray .set(typearray,offset)

function concatTypeArray(TypeArrayConstructor, ...typeArrayInstances) {
	let totalLength = 0;
	for (let arr of typeArrayInstances) {
		totalLength += arr.length;
	}
	let totalTypeArray = new TypeArrayConstructor(totalLength);
	let offset = 0;
	for (let arr of typeArrayInstances) {
		totalTypeArray.set(arr, offset);
		offset += arr.length;
	}
	return totalTypeArray;
}


function filterJsonp2JsonObject(jsonpStr) {
	if (jsonpStr != "") {
		var jsonStr = jsonpStr.toString().replace("success(", "").replace(");", "")
		return JSON.parse(jsonStr)
	}
	return null
}

function fixToHex2BitStr(num) {
	if (!isNaN(Number(num))) {
		let n = "00" + parseInt(num, 10).toString(16)
		return n.slice(-2)
	}
	return "00"
}

function getLocalTime(nS) {
	return new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
}

export {
	concatTypeArray,
	ab2str,
	str2ab,
	ab2hex,
	fixToHex2BitStr,
	getLocalTime,
	filterJsonp2JsonObject
}
