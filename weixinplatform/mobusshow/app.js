
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

//检查小程序 自动更新
  sysinfo.checkUpdateMiniProgaram()


}





})
