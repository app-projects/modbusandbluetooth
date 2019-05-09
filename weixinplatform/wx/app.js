
let  sysinfo = require("./utils/sysinfo.js")

App({
		inacitveData:{},
		historyData:{},
	
onLaunch:function(){
  if (sysinfo.checkVersionNotOk()) {
    wx.showModal({
      title: '提示',
      content: '微信版本过低，请您升级版本！',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  } else {
    console.log("微信版本ok.....")
  }

}


})
