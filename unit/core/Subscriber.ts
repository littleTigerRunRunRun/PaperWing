import Subscriber from '@/core/Subscriber'
const { 
  check,
  register,
  cancel,
  listen,
  once,
  remove,
  broadcast,
  clear
} = new Subscriber()

class Human {
  public name:string
  constructor(name:string) {
    this.name = name
  }
}

class Mother extends Human {
  constructor(name:string) { 
    super(name)
  }

  cook() {
    const course = '土豆烧牛肉'
    const main = '米饭'

    // 1000ms后饭菜烧好
    setTimeout(() => {
      broadcast('lunch', main, course)
    }, 1000)
  }
}

class Child extends Human {
  constructor(name:string) { 
    super(name)
  }

  wait() {
    listen('lunch', this.eat)
  }

  waitOnce() {
    once('lunch', this.eat)
  }

  doNotWait() {
    remove('lunch', this.eat)
  }

  eat = (main:string, course:string) => {
    console.log(`${this.name}吃到了主食：${main}和主菜：${course}`)
  }
}

// 测试程序，测试Event API的正确性
export default function main() {
  // 注册一个名为lunch的事件
  register('lunch')

  // 假设有妈妈和哥哥、弟弟
  const mother = new Mother('妈妈')
  const gg = new Child('哥哥')
  const dd = new Child('弟弟')

  // 他们监听了吃饭
  // mother.cook()
  // gg.wait()
  // dd.wait()

  // 弟弟由于有事情，半途不再等，出去吃了
  // mother.cook()
  // gg.wait()
  // dd.wait()
  // dd.doNotWait()

  // 哥哥不想吃晚饭
  // 午饭
  // mother.cook()
  // gg.waitOnce()
  // dd.wait()
  // check()
  // // 晚饭
  // setTimeout(() => {
  //   mother.cook()
  // }, 1000)

  // clear测试
  // gg.wait()
  // dd.wait()
  // gg.waitOnce()
  // clear()
  // check()

  // cancel测试，妈妈不想做午饭了
  mother.cook()
  gg.wait()
  dd.wait()
  cancel('lunch')
  check()
}
