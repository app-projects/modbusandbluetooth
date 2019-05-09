/* success({
  "list": [
    {
      "regsetterh8": "64",
      "regsetterl8": "12",
      "datah8": "0",
      "datal8": "100",
      "mac": "1",
      "fncode": "6",
      "timestamp": 1545051523707,
      "ip": "61.140.21.146:28339"
    }
  ],
  "svrtime": 1545844785572
});
 */
import {
	filterJsonp2JsonObject,
	fixToHex2BitStr,
	getLocalTime,
} from "../utils/datatrans"


let queryUrl = "http://47.110.78.124:8501/dev/log/modifyquery"
const app = getApp()

Page({

	data: {
		list: [],
		mac: ""
	},

	onLoad: function(options) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#1AAD19',
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })

	},

	requestModifyLog() {
		let uidata = app.dataformRead

		let that = this

		if (uidata != null && uidata.mac != "" && Boolean(uidata.mac) ) {
			var url = queryUrl + "/" + uidata.mac
			that.setData({
				mac: uidata.mac
			})
			wx.request({
				url: url, //请求地址
				dataType: "json",
				method: "GET", //get为默认方法/POST
				success: function(res) {
					let jsonpstr = res.data
					let message = filterJsonp2JsonObject(jsonpstr)
					if (message != null) {
					let tmp = null
						for (var k in message.list){
							tmp= message.list[k]
							if (tmp!=null){
								console.log("log tmp:",tmp)
								tmp.timestamp =getLocalTime(tmp.timestamp)
								tmp.regsetterh8 = fixToHex2BitStr(tmp.regsetterh8)
								tmp.regsetterl8 = fixToHex2BitStr(tmp.regsetterl8)
								
								tmp.datah8 = fixToHex2BitStr(tmp.datah8)
								tmp.datal8 = fixToHex2BitStr(tmp.datal8)
							}
							
						}
						
						that.setData({
								list: message.list
							})
					}
				},
				fail: function(err) {
					console.log(err)
				}, //请求失败
				complete: function(res) {
					console.log(res)
				} //请求完成后执行的函数
			})
		}

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.requestModifyLog()
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
