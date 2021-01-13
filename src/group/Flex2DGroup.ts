import { Container2DGroup, Container2DGroupConfig } from './Container2DGroup'
import { isRenderable, GetSetBound, GetSetNumber, childlike } from '../utils'
import { Dictionary, Direction } from '@/common'

interface Flex2DGroupConfig extends Container2DGroupConfig {

}

export interface FlexParams {
  grow?:number
  shrink?:number
  basic?:number
}

interface ChildFlexConfig {
  identity:number
  v:FlexParams
  h:FlexParams
}

export interface FlexItemConfig {
  identity?:number // 如果有的话，会加入后续的检索中
  v?:FlexParams
  h?:FlexParams
  direction:Direction // 'v' / 'h'
  items:Array<number>
}

interface FlexTarget {
  identity:number
  target:GetSetSize
  v:FlexParams
  h:FlexParams
}

interface GetSetSize extends GetSetBound {}

interface FlexItem extends GetSetSize {}

@GetSetNumber('x', 0)
@GetSetNumber('y', 0)
@GetSetNumber('width', 0)
@GetSetNumber('height', 0)
// 具备id的flex关系群会作为一个虚拟item参与后后续的布局计算中，当然了这样的flex关系也要有自己的StarTrackItemFlex
class FlexItem {
  public identity:number
  protected direction:Direction
  protected group:Flex2DGroup
  protected children:Array<FlexTarget> = []

  constructor({ identity, v, h, direction, items }:FlexItemConfig, group:Flex2DGroup) {
    this.group = group
    this.direction = direction
    this.identity = identity

    this.addChildren(items)
    if (this.identity) this.group.addFlexItem(this, { identity: this.identity, v, h })
  }

  protected addChildren(items:Array<number>) {
    for (const item of items) {
      this.children.push(this.group.getChildByIdentity(item))
    }
  }

  public deliverBound() {
    const width = this.width
    const height = this.height

    let basic = 0
    let grow = 0
    let shrink = 0
    if (this.direction === 'v') {
      for (const child of this.children) {
        basic += child.v.basic
        grow += child.v.grow
        shrink += child.v.shrink
      }
      if (basic > height) {

      } else {
        let y = this.y + height * -0.5
        for (const child of this.children) {
          // console.log(child.target, child.h.basic + 0)
          child.target.height = child.v.basic + (height - basic) * child.v.grow / (grow || 1)
          child.target.y = y + child.target.height * 0.5
          y += child.target.height
          
          child.target.width = this.width
          child.target.x = this.x
        }
      }
    } else {
      for (const child of this.children) {
        // console.log(child.h)
        basic += child.h.basic
        grow += child.h.grow
        shrink += child.h.shrink
      }
      if (basic > width) {
        // for (const child of this.children) {
        //   console.log(child.target, child.h.basic + 0)
        //   child.target.width = child.h.basic + 0
        // }
      } else {
        let x = this.x + width * -0.5
        for (const child of this.children) {
          // console.log(child.target, child.h.basic + 0)
          child.target.width = child.h.basic + (width - basic) * child.h.grow / (grow || 1)
          child.target.x = x + child.target.width * 0.5
          x += child.target.width

          child.target.height = this.height
          child.target.y = this.y
        }
      }
    }

    for (const child of this.children) {
      if (child.target instanceof FlexItem) child.target.deliverBound()
    }
  }
}

// 有一部分有点类似flex布局，但是更为复杂
export class Flex2DGroup extends Container2DGroup {
  protected itemsIndex:Dictionary<FlexTarget> = {}
  protected flexItems:Array<FlexItem> = []

  constructor({ name, width, height, helper = null }:Flex2DGroupConfig) {
    super({ name, width, height, helper })
  }

  public render(...argus:Array<any>) {
    // 传递render指令
    for (const child of this.children) {
      if (isRenderable(child)) {
        child.render(...argus)
      }
    }
  }

  public add(child:childlike):number {
    if (child.parent === this) return

    const index = super.add(child)
    if (this.subscriber) child.setSubscriber(this.subscriber)

    return index
  }

  public addFlexItem(flexItem:GetSetSize, config:ChildFlexConfig) {
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

  public getChildByIdentity(identity:number) {
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
  }

  onWidthChange(width:number) {
    super.onWidthChange(width)

    if (!this.flexItems) return
    // 做flex计算
    for (const flexItem of this.flexItems) {
      flexItem.width = this.width
      flexItem.deliverBound()
    }
  }

  onHeightChange(height:number) {
    super.onHeightChange(height)

    if (!this.flexItems) return
    // 做flex计算
    for (const flexItem of this.flexItems) {
      flexItem.height = this.height
      flexItem.deliverBound()
    }
  }
}