let _discoveryStarted = false

//--------------------------channel----------AfterConnected- start--------------------------------------
//连接某个设备成功后 ,加载通道
function loadBleDeviceServiceChannelAfterConnected(deviceId, successFn) {
	wx.getBLEDeviceServices({
		deviceId,
		success: (res) => {
			for (let i = 0; i < res.services.length; i++) {
				if (res.services[i].isPrimary) {
					doLoadCharaterChan(deviceId, res.services[i].uuid, successFn)
					return

				}
			}
		}
	})
}

function doLoadCharaterChan(deviceId, serviceId, succesFun) {
	wx.getBLEDeviceCharacteristics({
		deviceId: deviceId,
		serviceId: serviceId,
		//query response   ,所有字段存放在 characteristics中
		success: (res) => {
			
				for (let i = 0; i < res.characteristics.length; i++) {
					//取得字段
					let item = res.characteristics[i]
					if (succesFun != null && succesFun instanceof Function) {
					succesFun(deviceId, serviceId, item)
				}
			}
			console.log('doLoadCharaterChan success', res.characteristics)
		}
	})

}
//-----------------------channel---------AfterConnected end-------------------------------------------


//----------------------适配器相关----dev api start----------------------------------------------------
function refreshBluetoothAdapterState() {
	wx.getBluetoothAdapterState({
		success: (res) => {
			console.log('refreshBluetoothAdapterState', res)
			if (res.discovering) {
				getFoundBluetoothDevices()
			} else if (res.available) {
				startBluetoothDevicesSvrDiscovery()
			}
		}
	})
}

function startBluetoothDevicesSvrDiscovery() {
	if (_discoveryStarted) {
		return
	}
	_discoveryStarted = true
	wx.startBluetoothDevicesDiscovery({
		allowDuplicatesKey: true,
		success: (res) => {
			console.log('startBluetoothDevicesSvrDiscovery success', res)
			getFoundBluetoothDevices()
		},
	})
}

function getFoundBluetoothDevices() {
	wx.onBluetoothDeviceFound((res) => {
		res.devices.forEach(device => {
			if (!device.name && !device.localName) {
				return
			}
			if (instanceOfClassHasFunMember(channelMgr,"addDeV")) {
				channelMgr.addDeV(device)
			}

		})
	})
}

function out_createBLEConnection(deviceId, successFn,failFn) {
	wx.createBLEConnection({
		deviceId: deviceId,
		fail:(res)=>{
			if (failFn && failFn instanceof Function){
				failFn(res)
			}
		},
		success: (res) => {
			//连接设备成功，就加载服务通道
			loadBleDeviceServiceChannelAfterConnected(deviceId,function(devid, serviceId, item){
				if (instanceOfClassHasFunMember(channelMgr,"registerChannel")) {
					channelMgr.registerChannel(devid, serviceId, item)
				}
			})
			if (successFn && successFn instanceof Function){
				successFn(res)
			}
		},
	
	})

	stopBluetoothDevicesSvrDiscovery()
}

function stopBluetoothDevicesSvrDiscovery() {
	wx.stopBluetoothDevicesDiscovery()
}


//----------------------适配器相关----dev api end----------------------------------------------------


function out_closeBluetoothDev(deviceId, successFn, failFn) {
	wx.closeBLEConnection({
		deviceId: deviceId,
		success: function() {
			if (successFn != null && successFn instanceof Function) {
				successFn()
			}
		},
		fail: function() {
			if (failFn != null && failFn instanceof Function) {
				failFn()
			}
		}

	})
}

function registerChannelValueChangeBraodcastHandler(chanMgr) {
	wx.onBLECharacteristicValueChange(function(res) {
		console.log("hello world.....")
		if (chanMgr != null && (instanceOfClassHasFunMember(chanMgr,"chanValueChangeHandler"))) {
			console.log("蓝牙广播....！...")
			chanMgr.chanValueChangeHandler(res)
		}
	})
}

function out_startUpBlueApdter() {
	wx.openBluetoothAdapter({
		success: (res) => {
			console.log('openBluetoothAdapter success', res)
			//适配器成功开启，然后探索蓝牙
			startBluetoothDevicesSvrDiscovery()
		},
		fail: (res) => {
			if (res.errCode === 10001) {
				wx.onBluetoothAdapterStateChange(function(res) {
					console.log('onBluetoothAdapterStateChange', res)
					if (res.available) {
						startBluetoothDevicesSvrDiscovery()
					}
				})
			}
		}
	})
}


let channelMgr = {}

//----------------------------对外api start----------------------------------------

function instanceOfClassHasFunMember(ins ,funName){
	if (ins&& ins[funName] instanceof Function){
		return true
	}
	return false
}

//recvChannelValueHandler
//addDeV
function out_initBloothAdpter(chanMgrClassInst) {
	channelMgr = chanMgrClassInst
	registerChannelValueChangeBraodcastHandler(chanMgrClassInst)
}

function closeBluetoothAdapter() {
	wx.closeBluetoothAdapter()
}

export {
	out_startUpBlueApdter as startUpBlueApdter,
	out_initBloothAdpter as initBloothAdpter,
	out_createBLEConnection as createBLEConnection,
	out_closeBluetoothDev as closeBluetoothDev,
	registerChannelValueChangeBraodcastHandler as broadcast
}
