# SetQueue 

Extremely simple FIFO Queue using ES6 Set.

### Example

```js
import SetQueue from 'set-queue'

const Queue = new SetQueue()

Queue.add(1).add(2).add(3)

Queue.size ; // 3

const value = Queue.next() ; // 1

Queue.size ; // 2
```