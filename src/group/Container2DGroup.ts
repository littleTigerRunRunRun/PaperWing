import { BaseGroup } from './BaseGroup'
import { GetSetNumber, GetSetBound } from '../utils'
import { Shape } from '../core/Shape'
import { RGBAColorObject } from '@/common'

export interface Container2DGroupConfig {
  name:string
  width:number
  height:number
  helper?:ContainerHelperConfig
}

interface ContainerHelperConfig {
  fill?:RGBAColorObject
  stroke?:RGBAColorObject
  strokeWidth?:number
}

// 相比起一般的BaseGroup仅仅传递render，组织内容，它还具备一个实际的区域范围，类似于html里面的常规布局 display: inline
export interface Container2DGroup extends GetSetBound {}

@GetSetNumber('width', 0)
@GetSetNumber('height', 0)
@GetSetNumber('x', 0)
@GetSetNumber('y', 0)
export class Container2DGroup extends BaseGroup {
  protected helperShape:Shape

  constructor({ name, width, height, helper = null }:Container2DGroupConfig) {
    super({ name })

    this.width = width
    this.height = height
    if (helper) {
      const shapeConfig:any = {
        name: 'test',
        geometry: { type: 'rect', width, height, stroke: helper.strokeWidth || 0, x: this.x, y: this.y, rotate: 0 }
      }
      if (helper.fill) shapeConfig.fill = Object.assign({ type: 'pure' }, helper.fill)
      if (helper.stroke) shapeConfig.stroke = Object.assign({ type: 'pure' }, helper.stroke)

      this.helperShape = new Shape(shapeConfig)
      this.add(this.helperShape)
    }
  }

  // render(...argus:Array<any>) {
  //   super.render(...argus)

  //   // console.log(this.helperShape)
  //   // if (this.helperShape && isRenderable(this.helperShape)) this.helperShape.render(argus[0])
  // }

  onXChange() {
    console.log('x change')
  }

  onWidthChange(width:number) {
    if (this.helperShape) {
      this.helperShape.width = width
    }
  }

  onHeightChange(height:number) {
    if (this.helperShape) {
      this.helperShape.height = height
    }
  }
}
