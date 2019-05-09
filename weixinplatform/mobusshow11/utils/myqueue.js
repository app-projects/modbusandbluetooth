//类默认私有的
class Queue {

	constructor() {
		this.dataList = []
	}

	front() {
		let q = this.dataList
		return q[0]
	}
	enqueue(element) {
		this.dataList.push(element)
		// console.log("压入 一个 task 队列长度：", this.size())
	}

	dequeue() {
		let e = this.dataList.shift()
		return e
	}

	clear() {
		this.dataList = []
	}

	size() {
		return this.dataList.length
	}

	isEmpty() {
		return this.dataList.length == 0
	}
	toString() {
		console.log(this.dataList.toString())
	}

}

export {
	Queue as Queue
};
