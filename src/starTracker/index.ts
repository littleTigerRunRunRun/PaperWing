import { Scene, Shape, Flex2DGroup, FlexParams, FlexItemConfig } from '../index'
import { RGBAColorObject } from '../common'
import { GetSetNumber, GetSetSize } from '../utils'

const templates = []

// 基础数据格式定义：
// const AStarTrack = {
//   name: '', // 这个不必要
//   title: '四方型边框',
//   width: 400,
//   height: 240,
//   items: [
//     {
//       id: 1,
//       // 描述了这段路径的视觉容器（内部的话还需要路径位置展示）
//       type: 'rect',
//       // 描述了颜色
//       fill: { r: 1, g: 1, b: 1, a: 0.4 },
//        // 默认的grow和shrink就是0
//       h: { grow: 0, shrink: 0, basic: 20 },
//       v: { basic: 20 }
//     },
//     {
//       id: 2,
//       type: 'rect',
//       fill: { r: 1, g: 1, b: 1, a: 0.4 },
//       h: { grow: 1, shrink: 1, basic: 0 },
//       v: { grow: 1, shrink: 1, basic: 0 }
//     },
//     {
//       id: 3,
//       type: 'rect',
//       fill: { r: 1, g: 1, b: 1, a: 0.4 },
//       // 默认的grow和shrink就是0
//       h: { grow: 0, shrink: 0, basic: 20 },
//       v: { basic: 20 }
//     }
//   ],
//   flexs: [
//     {
//       items: [1, 2, 3],
//       direction: 'h'
//     }
//   ]
// }

type ItemType = 'rect' | 'line'

interface StarTrackItem {
  identity:number // 物件的唯一id
  type:ItemType
  fill:RGBAColorObject // 区域表示的颜色
  h:FlexParams
  v:FlexParams
}

export interface StarTrackConfig {
  name?:string // 这条星轨的英文名
  title?:string // 这条星轨的中文名
  width:number // 初始容器宽
  height:number
  items:Array<StarTrackItem>
  flexs:Array<FlexItemConfig>
}

export interface StarTrack extends GetSetSize {}

@GetSetNumber('width', 0)
@GetSetNumber('height', 0)
export class StarTrack {
  public name:string
  public title:string

  public container:Flex2DGroup

  constructor({
    name = '',
    title = '',
    width,
    height,
    items,
    flexs
  }:StarTrackConfig) {
    this.name = name
    this.title = title
    this.width = width
    this.height = height

    this.createContainer(width, height)
    this.createItems(items)
    this.container.addFlex(flexs)
  }

  protected createContainer(width:number, height:number) {
    this.container = new Flex2DGroup({
      name: 'container',
      width,
      height,
      helper: {
        stroke: { r: 1, g: 1, b: 1, a: 0.4 },
        strokeWidth: 4
      }
    })
  }

  protected createItems(items:Array<StarTrackItem>) {
    for (const item of items) {
      const shape = new Shape({
        name: `starItem_${item.identity}`,
        geometry: { type: item.type, width: item.h.basic, height: item.v.basic },
        fill: Object.assign({ type: 'pure' }, item.fill)
      })
      this.container.add(shape)
      this.container.addFlexItem(shape, item)
    }
  }
}
