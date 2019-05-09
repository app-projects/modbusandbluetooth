import {
	str2ab as String2ArrayBuffer,
	ab2str as ArrayBuffer2String
} from "./datatrans"


const scalespace = 2

class ByteArray {
	constructor(buf) {
		this.buf = buf
		if (buf != null && buf instanceof ArrayBuffer) {
			this.bytesOpt = new Uint8Array(buf)
		} else {
			this.bytesOpt = null
		}

		this.posWrite = 0
		this.posRead = 0
	}
	Length() {
		if (this.buf != null) {
			return this.buf.byteLength
		}
		return 0
	}
	Available() {
		return this.Length() - this.posRead
	}


	SetEndian(endian) {
		this.endian = endian
	}

	GetEndian() {
		return this.endian
	}


	//l 是增量
	grow(l) {
		if (l == 0) {
			return
		}
		let space = this.Length() - this.posWrite
		if (space >= l) {
			return
		}
		//增量+已经所处的位置(水位)
		let needGrowToLen = l + this.posWrite + space * scalespace //2 扩展系数
		let nowBuf = new ArrayBuffer(needGrowToLen)
		let newBytesOpt = new Uint8Array(nowBuf)
		newBytesOpt.set(this.bytesOpt) //copy

		this.bytesOpt = newBytesOpt
		this.buf = nowBuf
	}


	SetWritePos(pos) {
		if (pos > this.Length()) {
			this.posWrite = this.Length()
			return -1
		} else {
			this.posWrite = pos
		}
		return 0
	}

	SetWriteEnd() {
		this.SetWritePos(this.Length())
	}

	GetWritePos() {
		return this.posWrite
	}

	SetReadPos(pos) {
		if (pos > this.Length()) {
			this.posRead = this.Length()
			return -1
		} else {
			this.posRead = pos
		}
		return 0
	}

	SetReadEnd() {
		this.SetReadPos(this.Length())
	}

	GetReadPos() {
		return this.posRead
	}

	Seek(pos) {
		let res = this.SetWritePos(pos)
		this.SetReadPos(pos)
		return res
	}

	Reset() {
		this.buf = new ArrayBuffer(8)
		this.Seek(0)
	}

	Bytes() {
		return new Uint8Array(this.buf)
	}

	// 还有多少字节数据没有读出去
	BytesAvailable() {
		return new Uint8Array(this.buf, this.posRead, this.buf.byteLength)
	}

	Write(arrBuff) {
		if (arrBuff != null && arrBuff instanceof ArrayBuffer) {
			let len = arrBuff.byteLength
			this.grow(len)
			this.bytesOpt.set(new Uint8Array(arrBuff),this.posWrite)  //b.set(a, 2)
			this.posWrite += len
			return len
		}
		return 0
	}

	WriteBytes(arrBuff) {
		return this.Write(arrBuff)
	}


	WriteByte(num) {
		this.grow(1);
		let byteArr = Uint8Array.of(num)
		this.WriteBytes(byteArr.buffer)
	}

	WriteInt8(num) {
		this.grow(1);
		let byteArr = Int8Array.of(num)
		this.bytesOpt.setInt8(byteArr[0], this.GetWritePos())
	}


	WriteInt16(num) {
		this.grow(2);
		let byteArr = Int16Array.of(num)
		this.bytesOpt.setInt16(byteArr[0], this.GetWritePos())
	}

	WriteInt32(num) {
		this.grow(4);
		let byteArr = Int32Array.of(num)
		this.bytesOpt.setInt32(byteArr[0], this.GetWritePos())
	}

	WriteFloat32(num) {
		this.grow(4);
		let byteArr = Float32Array.of(num)
		this.bytesOpt.set(byteArr[0], this.GetWritePos())
	}

	WriteFloat64(value) {
		let byteArr = Float64Array.of(num)
		this.bytesOpt.set(byteArr[0], this.GetWritePos())
	}

	WriteBool(bool) {
		var bb = 0
		if (bool) {
			bb = 1
		} else {
			bb = 0
		}
		this.WriteByte(bb)
	}

	WriteString(str) {
		this.WriteBytes(String2ArrayBuffer(str))
	}

	WriteUTF(str) {
		let ab = String2ArrayBuffer(str)
		this.WriteInt16(ab.byteLength)
		this.WriteBytes(ab)
	}

	//==========read
	//返回 负数 说明没有读取到 
	Read(arrayBf) {
		if (arrayBf && arrayBf instanceof ArrayBuffer) {
			let len = arrayBf.byteLength
			if (len == 0) {
				return -1 //arrayBf 没有空间
			}
			if (len > this.Length() - this.posRead) {
				return -2 //还有 达到所需要的空间
			}

			let value = this.bytesOpt.subarray(this.posRead, this.posRead + len)
			this.posRead += value.byteLength

			let inputUint8Arr = new Uint8Array(arrayBf)
			inputUint8Arr.set(value, 0)

			return value.byteLength
		}
		return -3 //input arrayBf 参数有误
	}

	////todo lay 
	ReadBytes(arrayBuf, offset, len) {
		let bytes = new Uint8Array(arrayBuf)
		let newCuter = bytes.subarray(offset, offset + len)
		return this.Read(newCuter.buffer)
	}
	//byte 绝对不是负数  如果是负数说明 异常
	ReadByte() {
		let byt = new Uint8Array(1)
		let nread = this.ReadBytes(byt.buffer, 1, 0)

		if (nread > 0) {
			return byt[0]
		}
		return -1 //error
	}

	ReadInt8() {
		let int8Arr = this.bytesOpt.subarray(this.posRead, this.posRead + 1)
		if (int8Arr.byteLength > 0) {
			this.posRead = this.posRead + 1
			return int8Arr[0]
		}
		return -1
	}

	ReadInt16() {
		let int8Arr = this.bytesOpt.subarray(this.posRead, this.posRead + 2)
		if (int8Arr.byteLength > 0) {
			let int16Arr = new Int16Array(int8Arr.buffer)
			this.posRead = this.posRead + 2
			return int16Arr[0]
		}
		return -1
	}

	ReadInt32() {
		let int8Arr = this.bytesOpt.subarray(this.posRead, this.posRead + 4)
		if (int8Arr.byteLength > 0) {
			let int32Arr = new Int32Array(int8Arr.buffer)
			this.posRead = this.posRead + 4
			return int32Arr[0]
		}
		return -1
	}


	ReadFloat32() {
		let int8Arr = this.bytesOpt.subarray(this.posRead, this.posRead + 4)
		if (int8Arr.byteLength > 0) {
			let float32Arr = new Float32Array(int8Arr.buffer)
			this.posRead = this.posRead + 4
			return float32Arr[0]
		}
		return -1
	}

	ReadFloat64() {
		let int8Arr = this.bytesOpt.subarray(this.posRead, this.posRead + 8)
		if (int8Arr.byteLength > 0) {
			let float64Arr = new Float64Array(int8Arr.buffer)
			this.posRead = this.posRead + 8
			return float64Arr[0]
		}
		return -1
	}


	ReadBool() {
		let res = this.ReadByte()
		if (res >= 0) {
			return Boolean(res)
		}
		return false
	}

	ReadString(length) {
		let arrBuf = new ArrayBuffer(length)
		let res = this.ReadBytes(arrBuf, length, 0) // length  will read   0 ==offset
		if (res > 0) {
			return ArrayBuffer2String(arrBuf)
		} else {
			return "";
		}
		return ""
	}

	ReadUTF() {
		let l = this.ReadInt16()
		if (l < 0) {
			return ""
		}
		return this.ReadString(int(l))
	}
}


export {ByteArray as ByteArray}