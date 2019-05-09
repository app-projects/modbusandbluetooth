import {
	Queue
} from "../utils/myqueue"

class Task {
	constructor(hdl, ...args) {
		this.type = 0
		this.hdl = hdl
		this.args = args
		}
	
	execute() {
		if (this.hdl != null && this.hdl instanceof Function) {
			this.hdl(...this.args)
		}
	}

	reset() {
		this.hdl = null
		this.args = null
	}

}

const ticker =  Symbol("ticker")
const isStarted =  Symbol("isStarted")
class Worker {
	constructor(tickf) {
		this[ticker] = null
		this[isStarted] =false
		this.queue= new Queue()
		this.tickf = tickf || 100
	}
	start() {
		this.stop()
		let that = this
		this[isStarted] =true
		this[ticker] = setInterval(function() {
			that.routine()
		}, that.tickf)
	}

	routine() {
		let task = this.queue.dequeue()
		if (task != null) {
			task.execute();
		}
	}
	stop() {
		if (this[ticker] != null) {
			clearInterval(this[ticker])
			this[isStarted] =false
		}
	}

    hasStarted(){
		return  this[isStarted]
	}

	addTask(task) {
		if (task != null && task instanceof Task) {
			this.queue.enqueue(task)
		}
	}
}


export {Worker as Worker, Task as Task}