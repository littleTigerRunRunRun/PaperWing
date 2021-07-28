import { BaseGroup } from './BaseGroup'
import { GetSetNumber, GetSetSize, BuildMatrixManager2D, SignClassTypeName, childlike } from '../utils'
import { Shape } from '../core/Shape'
import { ComputeTexture } from '../computeTexture'
import Subscriber from '../core/Subscriber'

declare interface Container2DGroupConfig {
  name:string
  width:number
  height:number
  helper?:ContainerHelperConfig
  samplerRate?:number
  manual?:boolean
}

interface ContainerHelperConfig {
  fill?:RGBAColorArray
  stroke?:RGBAColorArray
  strokeWidth?:number
}

// 相比起一般的BaseGroup仅仅传递render，组织内容，它还具备一个实际的区域范围，类似于html里面的常规布局 display: inline
export interface Container2DGroup extends GetSetSize, MatrixManager2D, ClassTypeName {}

@SignClassTypeName('container2dGroup')
@BuildMatrixManager2D()
@GetSetNumber('width', 0)
@GetSetNumber('height', 0)
export class Container2DGroup extends BaseGroup {
  protected helperShape?:Shape
  protected manual:boolean = false
  protected samplerRate:number = 1
  protected computeTexture?:ComputeTexture

  constructor({ name, width, height, helper, samplerRate = 1, manual = false }:Container2DGroupConfig) {
    super({ name })

    this.width = width
    this.height = height
    if (helper) {
      const shapeConfig:any = {
        name: 'test',
        geometry: { type: 'rect', width, height, stroke: helper.strokeWidth || 0, x: this.x, y: this.y, rotate: 0 }
      }
      if (helper.fill) shapeConfig.fill = Object.assign({ type: 'pure' }, { color: helper.fill })
      if (helper.stroke) shapeConfig.stroke = Object.assign({ type: 'pure' }, { color: helper.stroke })

      this.helperShape = new Shape(shapeConfig)
      this.add(this.helperShape)
    }

    this.samplerRate = samplerRate
    this.manual = manual
  }

  // 如果是手动模式，我们将储存容器内的内容绘制为buffer保存
  protected waitAddChildren:Array<childlike> = []
  public add(child:childlike):number {
    if (this.manual) {
      if (this.computeTexture) return this.computeTexture.add(child)
      else {
        this.waitAddChildren.push(child)
        return -1
      }
    } else return super.add(child)
  }

  public setSubscriber(subscriber:Subscriber) {
    super.setSubscriber(subscriber)

    if (this.manual) {
      this.computeTexture = new ComputeTexture({
        subscriber,
        name: this.name + '_ct',
        width: this.width * this.samplerRate,
        height: this.height * this.samplerRate,
        samplerRate: this.samplerRate
      })

      for (const child of this.waitAddChildren) this.computeTexture.add(child)
      this.waitAddChildren.splice(0, this.waitAddChildren.length)
    }
  }

  renderManually() {
    this.computeTexture?.renderAndDownload()
  }

  protected lastArgus:Array<any> = []
  render(...argus:Array<any>) {
    if (this.computeTexture) {
      this.lastArgus = argus
      return
    }
    if (this.needRefreshMatrix) this.computeMatrix()

    super.render(...argus)

    // console.log(this.helperShape)
    // if (this.helperShape && isRenderable(this.helperShape)) this.helperShape.render(argus[0])
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
