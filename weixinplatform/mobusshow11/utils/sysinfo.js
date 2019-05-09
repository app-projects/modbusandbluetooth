function apiNotOk(){
	return wx.createBLEConnection==null || wx.createWorker==null
}

function checkVersionNotOk()
{
	return apiNotOk()
}

//加载就获得
var littleEndian = (function() {
  var buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true);
  
  return new Int16Array(buffer)[0] === 256;
})();


module.exports= {
	checkVersionNotOk:checkVersionNotOk,
	littleEndian:littleEndian,
}


