import { Flex2DGroup, Container2DGroup, Container2DGroupConfig, FlexParams, FlexItemConfig } from '../index'
import { RGBAColorObject, Extend, Vertical, Direction, Orientation, OrientationVector, FlexNumber, PercentStaticNumber } from '../common'
import { GetSetNumber, GetSetSize } from '../utils'
import { STShape } from './STShape'

export { Brush, Atom } from './Brush'
export { STShape } from './STShape'

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

type StarTrackContainerType = 'flex' | 'equal'

interface StarTrackItem {
  identity:number // 物件的唯一id
  desc?:string // 数据里的描述文本
  fill?:RGBAColorObject // 区域表示的颜色
  h:FlexParams
  v:FlexParams
  extends?:Extend
  type?:StarTrackContainerType
  [propName:string]:any
}

export interface StarTrackConfig {
  name?:string // 这条星轨的英文名
  title?:string // 这条星轨的中文名
  width:number // 初始容器宽
  height:number
  items:Array<StarTrackItem>
  flexs:Array<FlexItemConfig>
}

// 专用于StarTrack的定制Flex2DGroup，它和原本的Flex2DGroup有一些核心区别：
// 1. 可以预制方向，并且添加的内容将会按照这个方向运行
// 2. 不支持多方向，会尽量简化成一个单一flex关系
interface StarTrackSegmentGroupConfig extends Container2DGroupConfig {
  direction: Orientation // 以北方作为0度，分360度表示
  segs?:Array<StarTrackSegmentConfig>
}

type SegmentType = 'relative' | 'absolute' | 'sticky'
type StickyWay = 'start' | 'end' | 'center'

interface StarTrackSegmentConfig {
  name:string
  type?:SegmentType // 是flex挤压，还是依附于某个位置
  baseline?:Vertical // 线段基线,表示线段对准的基线
  verticalOffset?:number // 纵向基于基线的偏移
  thickness?:number
  flex?:FlexNumber // [percentLength, numberLength, flexRate] Length = percentLength * parentLength + numberLength + flexRate + marginSummary
  psWidth?:PercentStaticNumber
  // case: type === 'relative'
  order?:number // 对于relative类型的，需要先排序，后处理
  // case: type === 'absolute'
  psStart?:PercentStaticNumber // 根据方向的起始位置，数据结构虽然相似，但是start和end其实是[percentLength, staticLength]
  psEnd?:PercentStaticNumber // 根据方向的结束位置，start和end同时设置时，只有start会生效
  // case: type === 'sticky'
  stickyTarget?:string // 粘附对象的name
  stickyWay?:StickyWay // 粘附方式
  // style
  fill?:RGBAColorObject
  brush?:string
}

// 主要用于线段的有向flex容器
export class StarTrackSegmentGroup extends Flex2DGroup {
  private length:number = 0
  private thickness:number = 0
  private lengthChanged:boolean = false
  private direction:Direction = 'h'
  private directionVector:FlexNumber = [0, 0]

  private relatives:Array<STShape> = []
  private relativesFlexSummay:Array<FlexNumber> = []

  private absolutes:Array<STShape> = []
  private stickys:Array<STShape> = []
  constructor({ width, height, helper, name, segs, direction }:StarTrackSegmentGroupConfig) {
    super({ width, height, helper, name })

    this.directionVector = OrientationVector[direction] as FlexNumber
    if (direction === 'left' || direction === 'right') this.direction = 'h'
    else this.direction = 'v'

    if (segs) segs.forEach((seg) => this.addSegment(seg))
  }

  onWidthChange(width) {
    super.onWidthChange(width)
    this.lengthChanged = true
  }

  onHeightChange(height) {
    super.onHeightChange(height)
    this.lengthChanged = true
  }

  render(...argus:Array<any>) {
    // compute the length
    if (this.lengthChanged) {
      if (this.direction === 'v') {
        this.length = this.height
        this.thickness = this.width
      } else {
        this.length = this.width
        this.thickness = this.height
      }
    }

    // relative
    if (this.relatives.length > 0) {
      const summary = this.relativesFlexSummay[this.relativesFlexSummay.length - 1]
      const unit = (this.length - summary[0]) / summary[1]
      for (let i = 0; i < this.relatives.length; i++) {
        const seg = this.relatives[i]
  
        // const
        seg.offsetX = this.relativesFlexSummay[i][0] + this.relativesFlexSummay[i][1] * unit
        seg.setOffsetY(this.height)
        seg.length = this.relativesFlexSummay[i + 1][0] - this.relativesFlexSummay[i][0] + (this.relativesFlexSummay[i + 1][1] - this.relativesFlexSummay[i][1]) * unit
      }
    }

    if (this.absolutes.length > 0) {
      for (let i = 0; i < this.absolutes.length; i++) {
        const seg = this.absolutes[i]

        seg.offsetX = (seg.psStart || seg.psEnd)[0] * this.width / 100 + (seg.psStart || seg.psEnd)[1]
        seg.setOffsetY(this.height)
        seg.length = seg.psWidth[0] * this.width / 100 + seg.psWidth[1]
        console.log(seg)
      }
    }

    super.render(...argus)
  }

  // 向已经确定了方向的容器中添加一条线段
  // 这条线段可以有两种布局方式，一种是类似于flex的挤压，可以认为在文档流里面
  // 另一种则是依附于某个位置，这个位置可以是整体容器的百分比，也可以是某个线段的头或者尾
  addSegment(seg:StarTrackSegmentConfig) {
    switch (seg.type) {
      case 'relative': this.addRelativeSegment(seg);break
      case 'absolute': this.stickSegmentAtPosition(seg);break
      case 'sticky': this.stickSegmentToAnother(seg);break
    }
  }

  stickSegmentToAnother(seg:StarTrackSegmentConfig) {

  }

  stickSegmentAtPosition(seg:StarTrackSegmentConfig) {
    const sp = new STShape({
      name: seg.name,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
      thickness: seg.thickness || 10,
      psWidth: seg.psWidth,
      psStart: seg.psStart,
      psEnd: seg.psEnd,
      direction: this.directionVector,
      fill: seg.fill,
      brush: seg.brush,
      baseline: seg.baseline,
      verticalOffset: seg.verticalOffset
    })
    this.absolutes.push(sp)
    this.add(sp)
  }

  addRelativeSegment(seg:StarTrackSegmentConfig) {
    const sp = new STShape({
      name: seg.name,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
      thickness: seg.thickness || 10,
      order: seg.order,
      flex: seg.flex,
      direction: this.directionVector,
      fill: seg.fill,
      brush: seg.brush,
      baseline: seg.baseline,
      verticalOffset: seg.verticalOffset
    })
    this.relatives.push(sp)
    this.add(sp)
  }

  sortRelatives() {
    this.relatives.sort((a, b) => ((a.order || 0) - (b.order || 0)))
    this.relatives.map((seg, index) => {
      // 这里的summary使用了Summed Area Tables，为了加速求和计算的同时保留自己的值
      this.relativesFlexSummay[index] = [0, 0]
      this.relativesFlexSummay[index][0] = seg.flex[0] + (index === 0 ? 0 : this.relativesFlexSummay[index - 1][0])
      this.relativesFlexSummay[index][1] = seg.flex[1] + (index === 0 ? 0 : this.relativesFlexSummay[index - 1][1])
    })
    this.relativesFlexSummay.unshift([0, 0])
  }
}

// 主要用于星轨四个角的等比缩放容器
interface StarTrackEqualRatioGroupConfig extends Container2DGroupConfig {

}

export class StarTrackEqualRatioGroup extends Container2DGroup {
  constructor({ width, height, helper, name }:StarTrackEqualRatioGroupConfig) {
    super({ width, height, helper, name })
  }
}

export interface StarTrack extends GetSetSize {}

@GetSetNumber('width', 0)
@GetSetNumber('height', 0)
export class StarTrack{
  public name:string
  public title:string

  public container:Flex2DGroup

  public assets = {
    corner: {
      1: '1.png'
    },
    line: {
      dot: 'dot.png',
      normal: 'normal.png'
    }
  }

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
      // helper: {
      //   stroke: { r: 1, g: 1, b: 1, a: 0.4 },
      //   strokeWidth: 4
      // }
    })
  }

  // starTrack的本质是一个单轴的flex容器
  protected createItems(items:Array<StarTrackItem>) {
    for (const item of items) {
      const container = item.type === 'flex' ? new StarTrackSegmentGroup({
        name: `starItem_${item.identity}`,
        width: item.h.basic,
        height: item.v.basic,
        helper: item.fill ? { fill: item.fill } : null,
        direction: item.direction
      }) : 
      new StarTrackEqualRatioGroup({
        name: `starItem_${item.identity}`,
        width: item.h.basic,
        height: item.v.basic,
        helper: item.fill ? { fill: item.fill } : null
      })
      // const shape = new Shape({
      //   name: 
      //   geometry: { type: item.type, width: item.h.basic, height: item.v.basic },
      //   fill: Object.assign({ type: 'pure' }, item.fill)
      // })
      this.container.add(container)
      this.container.addFlexItem(container, item)
    }
  }

  public getChildByIdentity(identity:number):Flex2DGroup {
    return this.container.getChildByIdentity(identity).target as Flex2DGroup
  }
}
