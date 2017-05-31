# SetQueue 

Extremely simple FIFO Queue using ES6 Set. Note that Set's require every value to 
be unique so this is generally better suited for dealing with situations other than 
simple values.

> Package Developer uses this to handle queues of Promises where we want to process 
> the resolved promises in a FIFO-fashion on-demand.

At this time the package only implements the `Set` api partially and it is meant to 
just be a simple queue mechanism.  `Set` was used here over array as it will allow 
us to easily manipulate the queue in the future (for example directly removing values).

### Example

```js
import SetQueue from 'set-queue'

const Queue = new SetQueue()

Queue.add(1).add(2).add(3)

Queue.size ; // 3

const value = Queue.next() ; // 1

Queue.size ; // 2

for ( let item of Queue ) {
  console.log(item) ; // 2, 3
}

Queue.size ; // 0
```

### SagaObservable Example

Below is the source for [saga-observable](https://github.com/Dash-OS/saga-observable) which 
is what the micro-package was developed for.

```js
import { cancelled } from 'redux-saga/effects'
import { CANCEL } from 'redux-saga'
import SetQueue from 'set-queue'

const CreateSagaPromise = (promise, handler, oncancel) => {
  const SagaPromise = new promise(handler)
  SagaPromise[CANCEL] = oncancel
  return SagaPromise
}

const build_config = config => ({
  name: 'saga-observable',
  promise: Promise,
  throttle: undefined,
  ...config
})

export default class SagaObservable {
  constructor(config) {
    this.config = build_config(config)
    this.promise = this.config.promise
    this.name = Symbol(this.config.name)
    this.queues = {
      actions:  new SetQueue(),
      dispatch: new SetQueue(),
    }
  }

  publish = (...args) => {
    if (this.queues.dispatch.size) {
      this.queues.dispatch.next()(args)
    } else {
      this.queues.actions.add(args)
    }
  }

  next = () => {
    if (this.queues.actions.length) {
      return this.promise.resolve(this.queues.actions.next())
    } else {
      return CreateSagaPromise(
        this.promise,
        resolve => this.queues.dispatch.add(resolve),
        this.cancelled
      )
    }
  }

  cancelled = () => {
    this.isCancelled = true
    delete this.queues
    delete this.promise
    this.next = () => { throw new Error(`[SagaObservable] : ${this.name} next called after Cancellation`) }
    this.publish = (...args) => { console.warn('[SagaObservable] : Publish Received after Cancellation ', this.name, args) }
    return cancelled()
  }
}
```