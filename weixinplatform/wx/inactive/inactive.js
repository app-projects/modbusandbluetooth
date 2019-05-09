import {
	channelMgr
} from "../devcenter/devchannel"

const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		connected: true,
		canWrite: true,
		canRead: true,
		targetDev: {},
		currSelectCh: {},
		totalChannels: {},
		dataInputShow: "",
		dataOutput: ""
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

		console.log("inactive onload....")
		let that = this
		channelMgr.registerCallbackInfo({
			onChannelUpdate: function(dev) {
				that.onFresh()
			},

		})


	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {
		console.log("inactive onReady....")
	},

	onFresh: function() {
		let dev = app.inacitveData.device
		if (dev == null) return
		let that = this
		that.setData({
			targetDev: dev
		})
		let chans = []
		channelMgr.foreachChannelByDevId(dev.deviceId, function(devId, svrId, chan) {
			chans.push(chan)
			console.log("总共通道数量是:", chans.length, "devId:", devId, "svrid:", svrId, "chan:", chan)
			that.setData({
				totalChannels: chans
			})
		})
	},

	dataInputChange: function(e) {
		var value = e.detail.value
		this.setData({
			dataOutput: value
		})
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		console.log("inactive onShow....")
		this.onFresh()
	},
	uiSelectdChannel: function(e) {
		var ds = e.currentTarget.dataset
		app.inacitveData.selectedChan = ds
		this.setData({
			connected: true,
			currSelectCh: ds
		})
	},
	writeChan: function() {
		if (this.data.dataOutput != "") {
				let dv = Uint8Array.of(parseInt(this.data.dataOutput,16))
				console.log(parseInt(this.data.dataOutput,16).toString(16))
				let ds = app.inacitveData.selectedChan
				var ch = channelMgr.netRequestMofifyBuffer(ds.devId, ds.serviceId, ds.chanId, dv.buffer, function(res) {
					console.log("发送成功...:", dv.buffer.toString())
				})

		}
	},

	readChan: function() {

	},

	closeBLEConnection(e) {

	},
	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

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
