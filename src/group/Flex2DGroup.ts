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
  protected identity:number
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

  public deliverBound(width:number, height:number) {
    if (this.direction === 'v') {
      console.log(height)
    } else {
      let basic = 0
      let grow = 0
      let shrink = 0
      for (const child of this.children) {
        // console.log(child.h)
        basic += child.h.basic || 0
        grow += child.h.grow || 0
        shrink += child.h.shrink || 0
      }
      if (basic > width) {
        for (const child of this.children) {
          console.log(child.target, child.h.basic + 0)
          child.target.width = child.h.basic + 0
        }
      } else {
        let x = width * -0.5
        for (const child of this.children) {
          // console.log(child.target, child.h.basic + 0)
          child.target.width = child.h.basic + (width - basic) * child.h.grow / (grow || 1)
          child.target.x = x + child.target.width * 0.5
          x += child.target.width
        }
      }
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
    // 做flex计算
    for (const flexItem of this.flexItems) {
      flexItem.deliverBound(this.width, this.height)
    }

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
    this.itemsIndex[config.identity] = {
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
    for (const flex of flexs) {
      const flexItem = new FlexItem(flex, this)
      this.flexItems.push(flexItem)
    }
  }
}