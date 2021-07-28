import { Accumulator } from '../index'

interface ChildIndexGather {
  [key:number]: childlike
}

interface ChildNameGather {
  [key:string]: number
}

// 可以添加子节点的对象的抽象
export class Treelike {
  public children:Array<childlike> = []
  
  // 产生子节点index用的累加器对象
  protected childrenIndexAccumulator:Accumulator = new Accumulator()
  // 存储子节点对应的index的几何，index指向子节点对象
  protected childrenIndexs:ChildIndexGather = {}
  // 存储子节点name的集合，name指向它表示的index
  protected childrenNames:ChildNameGather = {}

  // 添加一个叶节点为子节点，倘若叶节点有name，这个name也会被存储
  public add(child:childlike, ...restOfArgus:Array<any>):number {
    // 如果child本身已经有父元素了，需要移除
    if (child.parent) {
      if (child.parent === this) return -1 // 父级就是自己，是重复添加，直接退出
      child.parent.remove(child)
    }

    const index:number = this.childrenIndexAccumulator.add()
    this.children.push(child)
    this.childrenIndexs[index] = child
    if (child.name) this.childrenNames[child.name] = index
    child.parent = this
    return index
  }
  
  // 根据子节点对象、子节点name、add时返回的index删除child，会同时删除三层
  public remove(child:childlike | string | number) {
    let name = ''
    let index = -1
    let childNode = null

    if (typeof child === 'string') {
      name = child
      index = this.childrenNames[name]
      childNode = this.childrenIndexs[index]
    } else if (typeof child === 'number') {
      index = child
      childNode = this.childrenIndexs[index]
      name = childNode.name
    } else if (child instanceof Leaflike || child instanceof Branchlike) {
      childNode = child
      if (childNode.name) {
        name = childNode.name
        index = this.childrenNames[name]
      } else {
        for (const i in this.childrenIndexs) {
          if (this.childrenIndexs[i] === child) index = parseInt(i)
        }
      }
    }

    if (name) delete this.childrenNames[name]
    delete this.childrenIndexs[index]
    if (childNode) {
      this.children.splice(this.children.indexOf(childNode), 1)
      childNode.parent = undefined
    } else throw new Error(`can not find child by info: ${child}`)
  }

  public getChildByIndex(index:number):childlike {
    return this.childrenIndexs[index]
  }

  public getChildByName(name:string):childlike {
    return this.getChildByIndex(this.childrenNames[name])
  }

  public clearChildren() {
    for (let child of this.children) {
      this.remove(child)
    }
  }  
}

interface LeafConfig {
  name?: string
}

// 可以被添加为子节点的对象的抽象
export class Leaflike {
  // name在PaperWing中是给用户用的
  public name:string = ''
  public parent?:parentlike
  protected subscriber?:PaperWingSubscriber

  constructor({ name = '' }:LeafConfig) {
    this.name = name
  }

  public setSubscriber(subscriber:PaperWingSubscriber) {
    this.subscriber = subscriber
  }
}

// 相比tree主干和leaf叶 ，它既有tree的特性，也有leaf的特性
export class Branchlike extends Treelike {
  public name:string = ''
  public parent?:parentlike
  protected subscriber?:PaperWingSubscriber

  constructor({ name = '' }:LeafConfig) {
    super()
    this.name = name
  }

  public setSubscriber(subscriber:PaperWingSubscriber) {
    this.subscriber = subscriber
  }
}
// MultiParentLeafObject: 允许被多个父级元素共享的子元素

export type childlike = Branchlike | Leaflike
export type parentlike = Treelike | Branchlike