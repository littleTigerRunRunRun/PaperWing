import { Container2DGroup } from './Container2DGroup'
import { SignClassTypeName, GetSetBound, GetSetNumber, childlike } from '../utils'

// interface Flex2DGroupConfig extends Container2DGroupConfig {}

declare interface FlexParams {
  grow?:number
  shrink?:number
  basic?:number
}

interface ChildFlexConfig {
  identity:number
  v:FlexParams
  h:FlexParams
}

type FlexSpaceType = 'between' | 'around' | 'even' | 'start' | 'center' | 'end'
interface FlexSpaceParams extends FlexParams {
  type:FlexSpaceType
}
const FlexSpaceFunction = {
  // 最后计算出一个数组，即每个子元素分配到多少间隔，不考虑shrink和grow生效的情况，那种情况注定没有间隔
  between(basic:number, value:number, space:Array<number>) {
    value = Math.max(value, 0) + basic // 间隙不会造成反向的收缩
    for (let i = 1; i < space.length; i++) space[i] = i * value / (space.length - 1)
  },
  around(basic:number, value:number, space:Array<number>) {
    value = Math.max(value, 0) + basic
    for (let i = 0; i < space.length; i++) space[i] = (i + 0.5) * value / space.length
  },
  even(basic:number, value:number, space:Array<number>) {
    value = Math.max(value, 0) + basic
    for (let i = 0; i < space.length; i++) space[i] = (i + 1) * value / (space.length + 1)
  },
  start(basic:number, value:number, space:Array<number>) {},
  center(basic:number, value:number, space:Array<number>) {
    space.fill(basic + value / 2)
  },
  end(basic:number, value:number, space:Array<number>) {
    space.fill(basic + value)
  },
}

declare interface FlexItemConfig {
  identity?:number // 如果有的话，会加入后续的检索中
  v?:FlexParams
  h?:FlexParams
  direction:Direction // 'v' / 'h'
  items:Array<number>
  space?:FlexSpaceParams
}

interface FlexTarget {
  identity:number
  target:GetSetBound
  v:FlexParams
  h:FlexParams
}

interface FlexItem extends GetSetBound {}
@GetSetNumber('x', 0)
@GetSetNumber('y', 0)
@GetSetNumber('width', 0)
@GetSetNumber('height', 0)
// 具备id的flex关系群会作为一个虚拟item参与后后续的布局计算中，当然了这样的flex关系也要有自己的StarTrackItemFlex
class FlexItem {
  public identity:number|undefined
  protected direction:Direction
  protected group:Flex2DGroup
  protected children:Array<FlexTarget> = []
  protected space?:FlexSpaceParams

  constructor({ identity, v, h, direction, items, space }:FlexItemConfig, group:Flex2DGroup) {
    this.group = group
    this.direction = direction
    this.identity = identity
    if (space) {
      this.space = {
        type: space.type || 'between',
        basic: space.basic || 0,
        grow: space.grow || 0,
        shrink: space.shrink || 0
      }
    }

    this.addChildren(items)
    if (this.identity) this.group.addFlexItem(this, { identity: this.identity, v: v || {}, h: h || {} })
  }

  protected addChildren(items:Array<number>) {
    for (const item of items) {
      this.children.push(this.group.getChildByIdentity(item))
    }
  }

  public deliverBound() {
    let basic = 0
    let grow = 0
    let shrink = 0
    // 统计来自child的三值
    for (const child of this.children) {
      basic += child[this.direction].basic || 0
      grow += child[this.direction].grow || 0
      shrink += child[this.direction].shrink || 0
    }
    // 处理间隙
    const space:Array<number> = new Array(this.children.length).fill(0)
    if (this.space) {
      basic += this.space.basic || 0
      grow += this.space.grow || 0
      shrink += this.space.shrink || 0
    }
    // 单位计算
    const size = this.direction === 'v' ? 'height' : 'width'
    const sizeValue = this.direction === 'v' ? this.height : this.width
    const position = this.direction === 'v' ? 'y' : 'x'
    const crossSize = this.direction === 'v' ? 'width' : 'height'
    const crossPosition = this.direction === 'v' ? 'x' : 'y'
    const surplus = this[size] - basic
    const unit = surplus > 0 ? surplus / (grow || 1) : surplus / (shrink || 1)
    // 分配space
    if (this.space) {
      // space = 
      FlexSpaceFunction[this.space.type](this.space.basic || 0, unit * (surplus > 0 ? this.space.grow || 0 : -(this.space.shrink || 0)), space)
      // console.log(space)
    }
    // if (this.space) console.log(this.space, space)

    // 分配定位、宽高给子元素
    let start = this[position] + sizeValue * -0.5
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      // console.log(child.target, child.h.basic + 0)
      child.target[size] = child[this.direction].basic || 0 + unit * (surplus > 9 ? child[this.direction].grow || 0 : -(child[this.direction].shrink || 0))
      child.target[position] = start + child.target[size] * 0.5 + space[i] // 位置 = 宽度递进 + 间距分配
      start += child.target[size]
      
      // child.target.height = this.height
      child.target[crossPosition] = this[crossPosition]
      if (child.target instanceof FlexItem) {
        child.target[crossSize] = this[crossSize]
        child.target.deliverBound()
      }
    }

    // for (const child of this.children) {
    //   if (child.target instanceof FlexItem) child.target.deliverBound()
    // }
  }
}

export interface Flex2DGroup extends ClassTypeName {}

// 目前有一个重大的疏漏，就是没有考虑内容的旋转、缩放等，不过我的建议是或许本身就可以不考虑
// 有一部分有点类似flex布局，但是更为复杂
@SignClassTypeName('flex2dGroup')
export class Flex2DGroup extends Container2DGroup {
  protected itemsIndex:Dictionary<FlexTarget> = {}
  protected flexItems:Array<FlexItem> = []

  // constructor({ name, width, height, helper = null }:Flex2DGroupConfig) {
  //   super({ name, width, height, helper })
  // }

  // public render(...argus:Array<any>) {
  //   // 传递render指令
  //   for (const child of this.children) {
  //     if (isRenderable(child)) {
  //       child.render(...argus)
  //     }
  //   }
  // }

  public add(child:childlike):number {
    if (child.parent === this) return -1

    const index = super.add(child)
    if (this.subscriber) child.setSubscriber(this.subscriber)

    return index
  }

  public addFlexItem(flexItem:GetSetBound, config:ChildFlexConfig) {
    if (this.itemsIndex[config.identity]) console.warn(`重复的itemId:${config.identity}`, this, this.itemsIndex[config.identity], flexItem)

    config.v.grow = config.v.grow || 0
    config.v.shrink = config.v.shrink || 0
    config.h.grow = config.h.grow || 0
    config.h.shrink = config.h.shrink || 0

    this.itemsIndex[config.identity] = {
      identity: config.identity,
      target: flexItem,
      v: config.v,
      h: config.h
    }
  }

  public getChildByIdentity(identity:number):FlexTarget {
    return this.itemsIndex[identity]
  }

  // 你可以认为是css flex布局类似的概念，区别在于容器里可以包含多层flex关系
  public addFlex(flexs:Array<FlexItemConfig>) {
    const withIdentityFlexs = flexs.filter((flex) => flex.identity !== undefined)
    const widthoutIdentityFlexs = flexs.filter((flex) => flex.identity === undefined)
    // 从flexs关系中抽出组放到itemsIndex索引中
    for (const flex of withIdentityFlexs) {
      const flexItem = new FlexItem(flex, this)
    }
    // 添加属于根节点的flex关系
    for (const flex of widthoutIdentityFlexs) {
      const flexItem = new FlexItem(flex, this)
      flexItem.width = this.width
      flexItem.height = this.height
      this.flexItems.push(flexItem)
    }

    this.refreshFlexItem()
  }

  public onWidthChange(width:number) {
    super.onWidthChange(width)
    this.refreshFlexItem()
  }

  public onHeightChange(height:number) {
    super.onHeightChange(height)
    this.refreshFlexItem()
  }

  // 需要被优化帧计算
  public refreshFlexItem() {
    if (!this.flexItems) return
    // 做flex计算
    for (const flexItem of this.flexItems) {
      flexItem.width = this.width
      flexItem.height = this.height
      flexItem.deliverBound()
    }
  }
}