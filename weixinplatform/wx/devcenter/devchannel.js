import {
	ByteArray
} from "../utils/bytearray"
import {
	Worker as Worker,
	Task as Task
} from "../worker/taskwoker"


const CHANNEL_SIZE = 1024

// 转换函数
/* function routineFn(self) {
	self.workerRoutine()
	console.log("task  ....-------------------------------------..", self.toString())
} */

class CharaterChannel {

	constructor(devId, serviceId, charaterCh) {
		this.charaterCh = charaterCh
		this.devId = devId
		this.serviceId = serviceId
		this.chanid = charaterCh.uuid

		this.recvBuf = new ArrayBuffer(CHANNEL_SIZE)
		this.byteArray = new ByteArray(this.recvBuf)

		//this.sndBuf = new ArrayBuffer(CHANNEL_SIZE)

		this.canRead = false
		this.canWrite = false
		this.canIndicate = false
		this.canNotify = false
		this.activeListener = false
		
		this.updateChanData(charaterCh)
		this.activeChannelListener()
		//this.initWorker()

	}
/* 	initWorker() {
		this.loopTask = null
		this.worker = new Worker(500)
		let t = new Task(routineFn, this)
		this.loopTask = t
		this.worker.addTask(t)
		this.worker.start()
	} */

	//工作.....
	workerRoutine() {
		//处理网络数据包
		this.pollChanNetData()
		if (this.loopTask != null) {
			this.worker.addTask(this.loopTask)
			console.log(this.loopTask)
		}

	}
	updateChanData(charaterCh) {
		if (charaterCh) {
			this.charaterCh = charaterCh
			this.canWrite = charaterCh.properties.write
			this.canRead = charaterCh.properties.read
			this.canNotify = charaterCh.properties.notify
			this.canIndicate = charaterCh.properties.indicate
			this.chanid = charaterCh.uuid
		}
	}
	tryStartWorker() {
		this.worker.start()
	}
	activeChannelListener() {
		let that = this
		if (this.canNotify || this.canIndicate) {
			wx.notifyBLECharacteristicValueChange({
				state: true, // 启用 notify 功能
				// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				deviceId: that.devId,
				// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
				serviceId: that.serviceId,
				// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
				characteristicId: that.chanid,
				success(res) {
					console.log(res.errMsg)
				}
			})
			this.activeListener = true
		}


	}

	toString() {
		console.log("channel des: devid:", this.devId, "svrid:", this.serviceId, " chanid:", this.chanid)
		console.log("channel state: canread:", this.canRead, "canWrite:", this.canWrite, " canIndicate:", this.canIndicate)
	}

	updateState(stateObject) {
		if (stateObject != null) {
			for (var k in stateObject) {
				if (this.hasOwnProperty(k)) {
					this[k] = stateObject[k]
				}
			}
		}

		if (this.canNotify || this.canIndicate) {
			if (!this.activeListener) {
				this.activeChannelListener()
			}
		}

	}



	//request refresh
	netRequestRefreshBuffer(onSuccess, onFail) {
		var that = this
		wx.readBLECharacteristicValue({
			deviceId: that.devId,
			serviceId: that.serviceId,
			characteristicId: that.chanid,
			fail: function(res) {
				if (onFail != null) {
					onFail(that.devId, that.serviceId, that.chanid)
				}
			},
			success: function(res) {
				console.log('读成功')
				if (onSuccess != null) {
					onSuccess()
				}
			},

		})
	}

//被底层触发的函数  脚本是一个线程 ，底层蓝牙推送是一个线程   ui交互 渲染 是一个独立的线程
	//recv from network  to refresh
	netRespdRefreshBuffer(arrayBuffer) {
		this.byteArray.WriteBytes(arrayBuffer)
		console.log("-------0x", this.byteArray.ReadByte().toString(16))
		while(1){
			//解析完整包，剩余的不完整 就退出循环
			
		}
		
	}
	//循环读取网络上面的数据
	pollChanNetData() {
		if (this.byteArray.Available()) {
			console.log(this.byteArray.ReadByte())
		}
	}

	netRequestMofifyBuffer(buffer, onSuccess, onFail) {
		var that = this
		wx.writeBLECharacteristicValue({
			deviceId: that.devId,
			serviceId: that.serviceId,
			characteristicId: that.chanid,
			value: buffer,
			fail: function(res) {
				if (onFail != null) {
					onFail(that.devId, that.serviceId, that.chanid, buffer)
				}
			},
			success: function(res) {
				console.log('发送成功')
				if (onSuccess != null) {
					onSuccess()
				}
			}
		})
	}

	write() {

	}

	read() {

	}
	onConnectLost() {

	}
}

class ServiceArea {
	constructor(devId, serviceId) {
		this.serviceId = serviceId
		this.devId = devId
		this.channelMap = {} //k charaterid  value CharaterChannel
	}
	hasChannel(channelid) {
		return (this.channelMap[channelid] != null) && (this.channelMap[channelid] instanceof CharaterChannel)
	}

	getChannel(channelid) {
		return this.channelMap[channelid]
	}

	register(charaterCh) {
		if (charaterCh != null) {
			let channelid = charaterCh.uuid
			if (!this.hasChannel(channelid)) {
				let ch = new CharaterChannel(this.devId, this.serviceId, charaterCh)
				this.channelMap[channelid] = ch
			} else {
				this.channelMap[channelid].updateChanData(charaterCh)
			}
		}
	}

	foreachChannel(recvFn) {
		if (recvFn != null && recvFn instanceof Function) {
			for (var k in this.channelMap) {
				recvFn(this.devId, this.serviceId, this.channelMap[k])
			}
		}
	}

	onConnectLost() {

	}

}

//设备管理组织 通道charater
class BlueDev {
	constructor() {
		this.devInfo = null //read
		this.devId = -1
		this.serviceMap = {}
		this.isconnected = false
	}
	hasSvr(svrId) {
		return (this.serviceMap[svrId] != null) && (this.serviceMap[svrId] instanceof ServiceArea)
	}
	updateInfo(devInfo) {
		this.devInfo = devInfo


	}
	getSvr(svrid) {
		return this.serviceMap[svrid]
	}

	register(svrId, charaterCh) {
		let svr = null
		if (svrId == null) return

		if (!this.hasSvr(svrId)) {
			svr = new ServiceArea(this.devInfo.deviceId, svrId)
			this.serviceMap[svrId] = svr
		} else {
			svr = this.serviceMap[svrId]
		}
		svr.register(charaterCh)
	}

	foreachChannel(recvFn) {
		if (recvFn != null && recvFn instanceof Function) {
			for (var k in this.serviceMap) {
				if (this.serviceMap[k]) {
					this.serviceMap[k].foreachChannel(recvFn)
				}
			}
		}
	}


	setConnState(connected) {
		this.connected = connected
	}
	getConnState() {
		return this.connected
	}

	onConnectLost() {

	}

}

//全局管理 通道charater
export default class ChannelMgr {
	constructor() {
		//扁平的channel管理
		this.channelsMap = {}
		//散列管理
		this.blueDevMap = {}
		this.onDevUpdate = []
		this.onChannelUpdate = []


	}

	hasDev(devId) {
		return (this.blueDevMap[devId] != null) && (this.blueDevMap[devId] instanceof BlueDev)
	}

	registerCallbackInfo(cbinfos) {
		if (cbinfos != null) {
			for (var k in cbinfos) {
				if (this.hasOwnProperty(k) && cbinfos[k] instanceof Function) {
					this[k].push(cbinfos[k])
				}
			}


		}
	}


	addDeV(device) {
		if (device == null) {
			return -1
		}
		// device.deviceId, device.localName, device.name
		let dev = null
		if (!this.hasDev(device.deviceId)) {
			dev = new BlueDev()
			this.blueDevMap[device.deviceId] = dev
		}
		dev = this.blueDevMap[device.deviceId]
		dev.setConnState(true)
		dev.updateInfo(device)

		if (this.onDevUpdate != null) {
			for (var k in this.onDevUpdate) {
				this.onDevUpdate[k](device)
			}
		}

		return 0
	}



	//todo
	registerChannel(devId, SvrId, charaterCh) {
		let dev = null
		let res = this.hasDev(devId)
		if (res) {
			let characterId = charaterCh.uuid
			dev = this.blueDevMap[devId]
			dev.register(SvrId, charaterCh)
			var key = [devId, SvrId, characterId].join("=")
			this.channelsMap[key] = dev.getSvr(SvrId).getChannel(characterId)


			if (this.onChannelUpdate != null) {
				for (var k in this.onChannelUpdate) {
					this.onChannelUpdate[k](this.channelsMap[key])
				}
			}
		}
	}

	findDev(devId) {
		return this.blueDevMap[devId]
	}


	//查找通道
	findChannel(devId, SvrId, characterId) {
		var key = [devId, SvrId, characterId].join("=")
		return this.channelsMap[key]
	}
	foreachDev(recvFn) {
		if (recvFn != null && recvFn instanceof Function) {
			for (var key in this.blueDevMap) {
				recvFn(key, this.blueDevMap[key])
			}
		}

	}
	foreachChannel(recvFn) {
		if (recvFn != null && recvFn instanceof Function) {
			for (var key in this.channelsMap) {
				recvFn(key, this.channelsMap[key])
			}
		}
	}

	foreachChannelByDevId(devId, recvFn) {
		if (devId) {
			let dev = this.findDev(devId)
			if (dev != null) {
				dev.foreachChannel(recvFn)
			} else {
				console.error("没有找到设备id:", devId, " 的通道")
			}
		}
	}

	netRequestMofifyBuffer(devId, SvrId, characterId, buffer, onSuccess, onFail) {
		let dev = this.findDev(devId)
		if (!dev.getConnState()) {
			if (onFail != null && onFail instanceof Function) { //断开连接了....
				onFail(devId, SvrId, characterId, buffer)
			}
			return
		}

		var ch = this.findChannel(devId, SvrId, characterId)
		if (ch) {
			ch.netRequestMofifyBuffer(buffer, onSuccess, onFail)
		}
	}

	setDevConnState(devId, isconnected) {
		var dev = findDev(devId)
		if (dev) {
			dev.setConnState(isconnected)
		}
	}

	updateChanState(devId, SvrId, characterId, stateObject) {
		var ch = this.findChannel(devId, SvrId, characterId)
		if (ch) {
			if (stateObject != null) {
				ch.updateState(stateObject)
			}
		}
	}

	/* 
	characteristicId
	:
	"0000FFE1-0000-1000-8000-00805F9B34FB"
	deviceId
	:
	"BA08A53D-CBAC-62CC-165A-B9D2BD8BBBFC"
	serviceId
	:
	"0000FFE0-0000-1000-8000-00805F9B34FB"
	value
	:
	ArrayBuffer {} */


	chanValueChangeHandler(res) {
		if (res) {
			// devId, SvrId, characterId
			var ch = this.findChannel(res.deviceId, res.serviceId, res.characteristicId)
			if (ch) {
				ch.netRespdRefreshBuffer(res.value)
			}
		}
		console.log("dev changnle vlaue reigister chanValueChangeHandler ....")
	}

}

let channelMgr = new ChannelMgr()


export {
	CharaterChannel,
	channelMgr as channelMgr
}
