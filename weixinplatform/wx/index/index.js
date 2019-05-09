import {
	initBloothAdpter,
	startUpBlueApdter,
	closeBluetoothDev,
	createBLEConnection,
} from "../devcenter/bloothadper"

import {
	channelMgr
} from "../devcenter/devchannel"

const app = getApp()

Page({
	data: {
		devices: [],
	},
	
	onFreshDev:function(){
		let allDevs = []
		let that = this
		channelMgr.foreachDev(function(k, dev) {
			allDevs.push(dev.devInfo)
		})
		that.setData({
			devices: allDevs
		})
	},
	
	
	onLoad(options) {
		console.log(channelMgr)
		let that = this
		channelMgr.registerCallbackInfo({
			onDevUpdate: function(dev) {
		   that.onFreshDev()
			},
			
		})
		console.log("index onLoad")
		initBloothAdpter(channelMgr)
		console.log("channelMgr.......")
	},
	
	onShow(){
		this.onFreshDev()
		console.log("index onshow")
	},
	
	uiOpenBluetoothAdapter() {
		startUpBlueApdter()
	},
	uiStopBlueSearch() {
		stopBluetoothDevicesSvrDiscovery()
	},
	uiCloseBleAdpter() {
		closeBluetoothAdapter()
	},
	uiconstructorOneDev(e) {
		var ds = e.currentTarget.dataset
		const deviceId = ds.deviceId
		createBLEConnection(deviceId,function(){
			  app.inacitveData.device = ds
				wx.switchTab({
					 url:"../inactive/inactive"
				})
			  
		})
	},

})
