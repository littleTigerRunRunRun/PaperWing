import { BaseGroup } from './BaseGroup'
import { mixin, SizeMixin, PositionMixin, isRenderable } from '../utils'
import { Shape } from '../core/Shape'
import { RGBAColorObject } from '@/common'
import { times } from 'lodash'

interface Container2DGroupConfig {
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

class MixinBaseGroup extends BaseGroup {}
interface MixinBaseGroup extends SizeMixin, PositionMixin {}
mixin(MixinBaseGroup, [SizeMixin, PositionMixin])

export class Container2DGroup extends MixinBaseGroup {
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

  onWidthChange() {
    if (this.helperShape) {
      this.helperShape.geometry.config.width = this._width
      this.helperShape.geometry.refreshGeometry()
    }
  }

  onHeightChange() {
    if (this.helperShape) {
      this.helperShape.geometry.config.height = this._height
      this.helperShape.geometry.refreshGeometry()
    }
  }
}
