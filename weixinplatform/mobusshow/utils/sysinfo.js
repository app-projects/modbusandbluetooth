function apiNotOk(){
	return wx.createBLEConnection==null
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

function checkUpdateMiniProgaram(finishCompleteFn){
  //检查是否存在新版本
  wx.getUpdateManager().onCheckForUpdate(function (res) {
    // 请求完新版本信息的回调
    console.log("是否有新版本：" + res.hasUpdate);
    if (res.hasUpdate) {//如果有新版本

      // 小程序有新版本，会主动触发下载操作（无需开发者触发）
      wx.getUpdateManager().onUpdateReady(function () {//当新版本下载完成，会进行回调
        wx.showModal({
          title: '更新提醒',
          content: '新版本已经准备好，单击确定重启应用',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              wx.getUpdateManager().applyUpdate();
            }
          }
        })

      })

      // 小程序有新版本，会主动触发下载操作（无需开发者触发）
      wx.getUpdateManager().onUpdateFailed(function () {//当新版本下载失败，会进行回调
        wx.showModal({
          title: '提示',
          content: '检查到有新版本，但下载失败，请检查网络设置',
          showCancel: false,
        })
      })
    }else{
        //无新版本，直接调用完成函数
      if (finishCompleteFn != null && finishCompleteFn instanceof Function){
        finishCompleteFn()
      }
    }
  });



}



module.exports= {
	checkVersionNotOk:checkVersionNotOk,
	littleEndian:littleEndian,
  checkUpdateMiniProgaram:checkUpdateMiniProgaram
}


