import { Dictionary } from '@/common'

interface PaperWingSubscriber {
  list:Dictionary<Array<any>>
  onceList:Dictionary<Array<any>>
  history:Dictionary<Array<any>>
  check()
  register(eventName:string, useHistory?:boolean)
  cancel(eventName:string)
  listen(eventName:string, callback:Function)
  once(eventName:string, callback:Function)
  remove(eventName:string, callback:Function)
  broadcast(eventName:string, ...argus:Array<any>)
  clear()
}

export default class Subscriber implements PaperWingSubscriber {
  list:Dictionary<Array<any>> = {}
  onceList:Dictionary<Array<any>> = {}
  history:Dictionary<Array<any>> = {}

  public check() {
    // 调试时查看订阅情况
    console.log('list:', this.list)
    console.log('onceList:', this.onceList)
    // console.log('history:', history)
  }
  
  // 注册一种新类型的事件
  register(eventName:string, useHistory?:boolean) {
    if (!this.list[eventName]) this.list[eventName] = []
    if (!this.onceList[eventName]) this.onceList[eventName] = []
    if (!this.history[eventName] && useHistory) this.history[eventName] = []
  }
  
  cancel(eventName:string) {
    if (!this.list[eventName]) return
    this.list[eventName].splice(0, this.list[eventName].length)
    delete this.list[eventName]
    this.onceList[eventName].splice(0, this.onceList[eventName].length)
    delete this.onceList[eventName]
  }
  
  // 参与监听一种事件
  listen(eventName:string, callback:Function) {
    if (!this.list[eventName]) this.register(eventName)
    // if (readHistory) {
    //   // 如果需要在创建时阅读历史推送
    //   for (const message of history[eventName]) {
    //     callback.apply(this, message)
    //   }
    // }
    
    this.list[eventName].push(callback)
  }
  

  // 与listen不同，是一次性的事件监听，即用即丢
  once(eventName:string, callback:Function) {
    if (this.history[eventName] && this.history[eventName].length > 0) {
      for (const item of this.history[eventName]) {
        callback.apply(this, item)
      }
      return
    }
    if (!this.onceList[eventName]) this.register(eventName)
    this.onceList[eventName].push(callback)
  }
  
  // 对某种事件广播信息
  broadcast(eventName:string, ...argus:Array<any>) {
    if (!this.list[eventName]) this.register(eventName)
    // 对listen类型的监听者广播
    if (this.list[eventName]) {
      for (const listener of this.list[eventName]) {
        listener.apply(this, argus)
      }
    }
    // 对once类型的监听者广播
    if (this.onceList[eventName]) {
      for (const listener of this.onceList[eventName]) {
        listener.apply(this, argus)
      }
      this.onceList[eventName].splice(0, this.onceList[eventName].length)
    }
  
    if (this.history[eventName]) this.history[eventName].push(argus)
  }

  // 相比broadcast会永远覆盖上一条也就是只会有最后一条历史记录
  // function cover(eventName)
  
  // 不建议remove掉once
  remove(eventName:string, callback:Function) {
    if (!this.list[eventName]) return
    const li = this.list[eventName].indexOf(callback)
    if (li > -1) this.list[eventName].splice(li, 1)
    if (li === -1) {
      const oi = this.list[eventName].indexOf(callback)
      if (oi > -1) this.list[eventName].splice(oi, 1)
    }
  }
  
  clear() {
    for (const key in this.list) {
      this.list[key].splice(0, this.list[key].length)
      delete this.list[key]
    }
    for (const key in this.onceList) {
      this.onceList[key].splice(0, this.onceList[key].length)
      delete this.onceList[key]
    }
    for (const key in this.history) {
      history[key].splice(0, this.history[key].length)
      delete this.history[key]
    }
    this.list = {}
    this.onceList = {}
    this.history = {}
  }
}