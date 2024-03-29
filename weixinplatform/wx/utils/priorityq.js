let PriorityQueue = (function () {

    class QueueElement {//优先队列元素包含（元素，优先级）
        constructor(element, priority){
            this.element = element;
            this.priority = priority;
        }
    }

    const items = new WeakMap();

    class PriorityQueue { 

        constructor () {
            items.set(this, []);
        }

        enqueue(element, priority){//主要修改，在新元素添加的时候，放到优先级相同位置，但是先添加到队列的元素，我们同样遵从先进先出的原则。
            let queueElement = new QueueElement(element, priority);

            let q = items.get(this);

            let added = false;
            for (let i=0; i<q.length; i++){
                if (queueElement.priority < q[i].priority){
                    q.splice(i,0,queueElement);
                    added = true;
                    break;
                }
            }
            if (!added){
                q.push(queueElement);
            }

            items.set(this, q);
        };

        dequeue() {
            let q = items.get(this);
            let r = q.shift();
            items.set(this, q);
            return r;
        }

        front() {
            let q = items.get(this);
            return q[0];
        }

        isEmpty(){
            return items.get(this).length == 0;
        }

        size(){
            let q = items.get(this);
            return q.length;
        }

        clear(){
            items.set(this, []);
        }

        print(){
            let q = items.get(this);
            for (let i=0; i<q.length; i++){
                console.log(`${q[i].element}  - ${q[i].priority}`);
            }
        };
    }
    return PriorityQueue;
})();


// let priorityQueue = new PriorityQueue();
