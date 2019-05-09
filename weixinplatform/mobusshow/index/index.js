import {
  filterJsonp2JsonObject
} from "../utils/datatrans"

const app = getApp()


// let pushmsgUrl = "c"
// api.msg.cloudchip.net
let pushmsgUrl = "https://www.cloudchip.net/dev/svr/msg/push"
// let pushmsgUrl = "http://192.168.1.107:8520/dev/svr/msg/push"
// let queryUrl = "http://47.110.78.124:8520/dev/msg/getreg/{mac}/{regh}/{regl}/0/1"
let queryUrl = "https://www.cloudchip.net/dev/msg/getreg/{mac}/{regh}/{regl}/0/1"


let prelookData = null
let pushParamsFmt = "/{mac}/{msg_type}/{offset_h}/{offset_l}/{data_h}/{data_l}"


let preSndReadReqUrl = null 
let reyRequestDelay = 400 //3sec描述
let preSndTimeoutFlag = -1

function getLocalTime(nS) {
  return new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
}

Page({
  data: {
    tip: "",
    tipColor: "red",
    devices: [],
    dataformRead: {},
    datal_show: "",
    datah_show: "",
  },

  macChange(e) {
    var value = e.detail.value
    this.data.dataformRead.mac = value
  },
  reghChange(e) {
    var value = e.detail.value
    this.data.dataformRead.regh = value
  },
  reglChange(e) {
    var value = e.detail.value
    this.data.dataformRead.regl = value
  },
  datahChange(e) {
    var value = e.detail.value
    this.data.dataformRead.datah = value
  },
  datalChange(e) {
    var value = e.detail.value
    this.data.dataformRead.datal = value
  },

  setTip(tip, isSerious) {
    let str = "温馨提示:" + tip
    let color = "green"
    if (Boolean(isSerious)) {
      color = "red"
    }
    this.setData({
      tip: str,
      tipColor: color
    })
  },

  checkInputSet() {
    if (this.data.dataformRead.mac == "") {
      this.setTip("mac地址不能为空....", true)
      return false
    }
    if (this.data.dataformRead.regh == "") {
      this.setTip("寄存器高8位不能为空....", true)
      return false
    }

    if (this.data.dataformRead.datah == "") {
      this.setTip("数据高8位不能为空....", true)
      return false
    }
    if (this.data.dataformRead.datal == "") {
      this.setTip("数据低8位不能为空....", true)
      return false
    }
    return true
  },

  checkInputRead() {
    if (this.data.dataformRead.mac == "") {
      this.setTip("mac地址不能为空....", true)
      return false
    }
    if (this.data.dataformRead.regh == "") {
      this.setTip("寄存器高8位不能为空....", true)
      return false
    }
    return true
  },

  uiSetting(e) {
    console.log("表格数据：", this.data.dataformRead)
    if (this.checkInputSet()) {
      this.pushParam()
    }
  },

  retryQuery(){
    let that =this
    preSndTimeoutFlag =setTimeout(function(){
      if (preSndReadReqUrl != "" && preSndReadReqUrl!=null){
        that.queryParam(preSndReadReqUrl,null)
      }
      clearTimeout(preSndTimeoutFlag)
    }, reyRequestDelay)
    
  },

  uiRead(e) {
    let that = this
    if (this.checkInputRead()) {
      let url = queryUrl
      url = url.replace("{mac}", parseInt(this.data.dataformRead.mac, 16))
      url = url.replace("{regh}", parseInt(this.data.dataformRead.regh, 16))
      url = url.replace("{regl}", parseInt(that.data.dataformRead.regl, 16))
      
      this.queryParam(url,function(){
        that.retryQuery()
      })
    }


  },

  onLoad(options) {
    this.setTip("mac不能为空")
    app.dataformRead = this.data.dataformRead
  },

  pushParam() {
    var that = this;
    var param = pushParamsFmt.replace("{msg_type}", 0)
    param = param.replace("{mac}", that.data.dataformRead.mac)
    param = param.replace("{offset_h}", parseInt(that.data.dataformRead.regh, 16))
    param = param.replace("{offset_l}", parseInt(that.data.dataformRead.regl, 16))
    param = param.replace("{data_h}", parseInt(that.data.dataformRead.datah, 16))
    param = param.replace("{data_l}", parseInt(that.data.dataformRead.datal, 16))
    var url = pushmsgUrl + param

    console.log("发起数据推送：", url)

    wx.request({
      url: url, //请求地址
      dataType: "json",
      method: "GET", //get为默认方法/POST
      success: function (res) {
        let jsonpstr = res.data
        let message = filterJsonp2JsonObject(jsonpstr)
        if (message != null) {
          if (message.res == 0) {
            that.setTip("服务器已接收修改")
          } else if (message.hasOwnProperty("tip")) {
            that.setTip(message.tip)
          }
        }
      },
      fail: function (err) {
        console.log(err)
      }, //请求失败
      complete: function (res) {
        console.log(res)
      } //请求完成后执行的函数
    })
  },


  queryParam(url,sucFn) {
    let that = this

    console.log("queryParam:", url)
    preSndReadReqUrl = url
    wx.request({
      method: "GET", //get为默认方法/POST
      url: url,
      dataType: "json",
      success: function (res) {
        let jsonpstr = res.data
        let message = filterJsonp2JsonObject(jsonpstr)
        if (message) {
          if (message.hasOwnProperty("tip")) {
            that.setTip(message.tip, message.res != 0)
          } else {
            let dateStr = getLocalTime(message.timestamp)
            let regStr = message.reg.toString(16)
            let valueStr = ("0000" + message.value.toString(16)).slice(-4);
            let valueL = valueStr.substr(2)
            let valueH = valueStr.substr(0, 2)
            //


            if (sucFn != null && sucFn instanceof Function) {
              sucFn()
            }else{
                 //第二次则更新，注要是延迟请求了....

              that.setData({
                datah_show: valueH,
                datal_show: valueL
              })

              let regH = ("00" + that.data.dataformRead.regh).slice(-2)
              let regL = ("00" + that.data.dataformRead.regl).slice(-2)

              that.data.dataformRead.datah = valueH
              that.data.dataformRead.datal = valueL

              that.setTip("寄存器:0x" + (regH + regL + "返回值:0x" + valueH + valueL))
              console.log("dateStr:", dateStr, "regStr:", regStr, "valueStr:", valueStr, " valueH:", valueH, " valueL:",
                valueL)

            }

          }
        }

    

      },
      fail: function (err) {
        console.log(err)
      }, //请求失败
      complete: function (res) { //请求完成后最终执行参数
        // that.setTip("设置服务器不在工作状态")
        console.log(res)
      }
    });

     

  }

})
