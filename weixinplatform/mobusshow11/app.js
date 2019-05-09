
let  sysinfo = require("./utils/sysinfo.js")

App({
		inacitveData:{},
		historyData:{},
	
onLaunch:function(){

  wx.setNavigationBarTitle({
    title: '终端遥控台'
  })  

  wx.setNavigationBarColor({
    frontColor: '#ffffff',
    backgroundColor: '#1AAD19',
    animation: {
      duration: 400,
      timingFunc: 'easeIn'
    }
  })


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

},


})
