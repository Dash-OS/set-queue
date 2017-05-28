
export default class SetQueue {
  constructor() {
    this.set = new Set()
  }
  next = () => {
    const values = this.set.values()
    const next = values.next()
    this.set.delete(next.value)
    return next.value
  }
  add = item => this.set.add(item)
  delete = item => this.set.delete(item)
  get size() { return this.set.size }
  get length() { return this.set.size }
}