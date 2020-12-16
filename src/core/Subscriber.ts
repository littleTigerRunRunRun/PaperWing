import { Dictionary } from '@/common'

let list:Dictionary<Array<any>> = {}
let onceList:Dictionary<Array<any>> = {}
let history:Dictionary<Array<any>> = {}

function check() {
  // 调试时查看订阅情况
  console.log('list:', list)
  console.log('onceList:', onceList)
  // console.log('history:', history)
}

// 注册一种新类型的事件
function register(eventName:string, useHistory?:boolean) {
  if (!list[eventName]) list[eventName] = []
  if (!onceList[eventName]) onceList[eventName] = []
  if (!history[eventName] && useHistory) history[eventName] = []
}

function cancel(eventName:string) {
  if (!list[eventName]) return
  list[eventName].splice(0, list[eventName].length)
  delete list[eventName]
  onceList[eventName].splice(0, onceList[eventName].length)
  delete onceList[eventName]
}

// 参与监听一种事件 // , readHistory:boolean = false
function listen(eventName:string, callback:Function) {
  if (!list[eventName]) register(eventName)
  // if (readHistory) {
  //   // 如果需要在创建时阅读历史推送
  //   for (const message of history[eventName]) {
  //     callback.apply(this, message)
  //   }
  // }
  
  list[eventName].push(callback)
}

// 与listen不同，是一次性的事件监听，即用即丢
function once(eventName:string, callback:Function) {
  if (history[eventName] && history[eventName].length > 0) {
    for (const item of history[eventName]) {
      callback.apply(this, item)
    }
    return
  }
  if (!onceList[eventName]) register(eventName)
  onceList[eventName].push(callback)
}

// 对某种事件广播信息
function broadcast(eventName:string, ...argus:Array<any>) {
  if (!list[eventName]) register(eventName)
  // 对listen类型的监听者广播
  if (list[eventName]) {
    for (const listener of list[eventName]) {
      listener.apply(this, argus)
    }
  }
  // 对once类型的监听者广播
  if (onceList[eventName]) {
    for (const listener of onceList[eventName]) {
      listener.apply(this, argus)
    }
    onceList[eventName].splice(0, onceList[eventName].length)
  }

  if (history[eventName]) history[eventName].push(argus)
}

// 相比broadcast会永远覆盖上一条也就是只会有最后一条历史记录
// function cover(eventName)

// 不建议remove掉once
function remove(eventName:string, callback:Function) {
  if (!list[eventName]) return
  const li = list[eventName].indexOf(callback)
  if (li > -1) list[eventName].splice(li, 1)
  if (li === -1) {
    const oi = list[eventName].indexOf(callback)
    if (oi > -1) list[eventName].splice(oi, 1)
  }
}

function clear() {
  for (const key in list) {
    list[key].splice(0, list[key].length)
    delete list[key]
  }
  for (const key in onceList) {
    onceList[key].splice(0, onceList[key].length)
    delete onceList[key]
  }
  for (const key in history) {
    history[key].splice(0, history[key].length)
    delete history[key]
  }
  list = {}
  onceList = {}
  history = {}
}

interface PaperWingEvent {
  check()
  register(eventName:string, useHistory?:boolean)
  cancel(eventName:string)
  listen(eventName:string, callback:Function)
  once(eventName:string, callback:Function)
  remove(eventName:string, callback:Function)
  broadcast(eventName:string, ...argus:Array<any>)
  clear()
}

const paperWingEvent:PaperWingEvent = { 
  check,
  register,
  cancel,
  listen,
  once,
  remove,
  broadcast,
  clear
}

export default paperWingEvent