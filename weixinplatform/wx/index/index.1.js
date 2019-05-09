const app = getApp()

var characteristics =null




///failed to do
function sendMofifyCharaterFieldValueByBle(connected,deviceId, serviceId, fieldId, buffer,onSuccess,onFail){
  if (connected) {
    wx.writeBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: fieldId,
      value: buffer,
			fail:function(res){
				if (onFail!=null){
					onFail(connected,deviceId, serviceId, fieldId, buffer)
				}
			},
      success: function (res) {
        console.log('发送成功')
        if (onSuccess!=null){
          onSuccess()
        }
      }
    })
  }
  else {
    wx.showModal({
      title: '提示',
      content: '蓝牙已断开',
      showCancel: false,
      success: function (res) {
        that.setData({
          searching: false
        })
      }
    })
  }



}


 function sendQueryCharaterFieldValueByBle(deviceId,serviceId,charateruid){
	wx.readBLECharacteristicValue({
		deviceId:deviceId,
		serviceId:serviceId,
		characteristicId:charateruid
	})
}



const pageObject={
  data: {
    devices: [],
    connected: false,
    currselectDev:null,
    chs: [],
    _discoveryStarted:false
  },
	

//蓝牙适配器是一个连接蓝牙服务的终端client管理器
  onUIOpenBluetoothAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        //适配器成功开启，然后探索蓝牙
        this.startBluetoothDevicesSvrDiscovery()
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.startBluetoothDevicesSvrDiscovery()
            }
          })
        }
      }
    })
  },



/*******************
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesSvrDiscovery()
        }
      }
    })
  },
*****************/



  startBluetoothDevicesSvrDiscovery() {
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        console.log('startBluetoothDevicesSvrDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
    })
  },
  stopBluetoothDevicesSvrDiscovery() {
    wx.stopBluetoothDevicesDiscovery()
  },




//遍历所有的蓝牙设备
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {

      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
      }
      )
    }

    
    )
  },



//界面创建蓝牙连接
  onUICreateBLEConnectionCallback(e) {
    var ds  = e.currentTarget.dataset
    this.setData({ currselectDev: e.currentTarget.dataset})
    const deviceId = ds.deviceId
    const name = ds.name

    wx.createBLEConnection({
      deviceId,

      success: (res) => {
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
      }

    })
    this.stopBluetoothDevicesSvrDiscovery()
  },



//关闭蓝牙连接
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
      canRead:false
    })
  },

  //获得某个设备的所有服务区 的数据字段集
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      }
    })
  },




//查询设备的deviceId 的服务编号serviceId 就是一个字段属性的地址，就如modbus rtu的 offset ,数据情况
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
    //query response   ,所有字段存放在 characteristics中
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
				console.log("获得设备:",deviceId," serviceId",serviceId,"所有特征值 length:",res.characteristics.length)
				
        for (let i = 0; i < res.characteristics.length; i++) {
//取得字段
          let item = res.characteristics[i]
			 
					var oneDes= "charaterkey"+item.uuid
					
					if (item.properties.read){
						oneDes+="可读"
					}else{
						oneDes+="不可读"
					}
					
					if (item.properties.write){
						oneDes+="可写"
					}else{
						oneDes+="不可写"
					}
					
					if (item.properties.notify){
						  oneDes+="notify"
					}else{
						oneDes+="无notify"
					}
					
					if (item.properties.indicate){
						oneDes+="通知性ack"
					}else{
						
					}
					
					console.log(oneDes)
					
					
          // 字段io 情况 poll  read
          if (item.properties.read) {
            this.setData({
              canRead: true
            })
						
          }



          // 字段io 情况 poll  write
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
						
						if (i==0){
							this._characteristicId = item.uuid
						}
						

          }

 
               //在下面的 写领先
          if (item.properties.notify || item.properties.indicate) {
          
						wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
						
						
          }
					
        }
      },

      
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })



    // 承接上面逻辑 ，说明后的数据 ， 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      if (idx === -1) {
        data[`chs[${this.data.chs.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      }
  
	    let str = ab2hex(characteristic.value)
	
		
      console.log("  当前 channel 的dataBufer:",str)

 
      this.setData(data)
    })
		
		
		
  },




//输入数据代码块-------------------------------------------------------输入数//---------------------------------------------------------------------------------------------- //to do morning to encap input text to bytes to send when success to next one

  writeBLECharacteristicValue() {
    // 向蓝牙设备发送一个0x00的16进制数据
  let bytes = new Uint8Array([0xAA]);
	//of是可变参数列表
	// Uint8Array.of(0xAA,0xBB)
	 Uint8Array.from([0xAA])
  var that =this
    sendMofifyCharaterFieldValueByBle(true, this._deviceId, this._serviceId, "0000FFE1-0000-1000-8000-00805F9B34FB", bytes.buffer,
		function(res){
			console.log("send successfully ....",res)
     
		},
+		function(res){
			console.log("send failed ....")

		})
  },


queryBleCharaterValue(){
	sendQueryCharaterFieldValueByBle(this._deviceId,this._serviceId,"0000FFE1-0000-1000-8000-00805F9B34FB")
},

closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  }




}


Page(pageObject)