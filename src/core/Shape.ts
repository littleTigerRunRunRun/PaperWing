import { Leaflike, constantValue } from '../utils'
import { getGeometry, GeometryType, GeometryConfig } from '../geometry/index'
import { getMaterial, MaterialType, MaterialConfig } from '../material/index'
import { GLContext, Length16Array } from '@/common'
import { Model } from '@luma.gl/engine'
import { RenderParams } from './Scene'
import { Matrix4 } from 'math.gl'

interface ShapeConfig {
  name?:string
  visible?:boolean
  geometry:GeometryConfig,
  material?:MaterialConfig // 3d的概念里面更多用material
  fill?:MaterialConfig // 2d的概念里往往需要分成fill和stroke处理
  stroke?:MaterialConfig
}

export class Shape extends Leaflike {
  public geometry:GeometryType
  public material:MaterialType
  public fill:MaterialType
  public stroke:MaterialType
  public model:Model
  public fillModel:Model
  public strokeModel:Model
  public modelMatrix:Matrix4
  public gl:GLContext
  private geometryConfig:GeometryConfig
  private materialConfig:MaterialConfig
  private fillConfig:MaterialConfig
  private strokeConfig:MaterialConfig

  public set x(x:number) { this.geometry.x = x }
  public get x():number { return this.geometry.x }
  public set y(y:number) { this.geometry.y = y }
  public get y():number { return this.geometry.y }
  public set rotate(rotate:number) { this.geometry.rotate = rotate }
  public get rotate():number { return this.geometry.rotate }
  
  private _visible:boolean
  public get visible() { return this._visible }
  public set visible(visible:boolean) { this._visible = visible }

  constructor({ name, geometry, material, fill, stroke, visible = true }:ShapeConfig) {
    super({ name })

    this.visible = visible
    this.geometryConfig = geometry
    this.materialConfig = material
    this.fillConfig = fill
    this.strokeConfig = stroke
  }

  public setSubscriber(subscriber) {
    super.setSubscriber(subscriber)
    
    this.subscriber.once('getGl', this.getGl)
  }

  private getGl = (gl:GLContext) => {
    this.gl = gl
    this.init(this.geometryConfig, this.materialConfig, this.fillConfig, this.strokeConfig)
  }

  private init(geometry:GeometryConfig, material:MaterialConfig, fill:MaterialConfig, stroke:MaterialConfig) {
    this.geometry = getGeometry(geometry)
    if (material) this.material = getMaterial(material)
    if (fill) this.fill = getMaterial(fill)
    if (stroke) this.stroke = getMaterial(stroke)

    const is2:boolean = (this.gl as any)._version === 2

    if (this.material) {
      const receipt = this.material.getReceipt(is2)
      this.model = new Model(this.gl, {
        vs: receipt.vs,
        fs: receipt.fs,
        defines: {},
        uniforms: Object.assign({
        }, receipt.uniforms),
        modules: [constantValue],
        geometry: this.geometry.geometry
      })
    } else {
      const fillReceipt = this.fill.getReceipt(is2)
      this.fillModel = new Model(this.gl, {
        vs: fillReceipt.vs,
        fs: fillReceipt.fs,
        defines: {},
        uniforms: Object.assign({
        }, fillReceipt.uniforms),
        modules: [constantValue],
        geometry: this.geometry.geometry
      })
      if (this.stroke) {
        const strokeReceipt = this.stroke.getReceipt(is2)
        this.strokeModel = new Model(this.gl, {
          vs: strokeReceipt.vs,
          fs: strokeReceipt.fs,
          defines: {},
          uniforms: Object.assign({
          }, strokeReceipt.uniforms),
          modules: [constantValue],
          geometry: this.geometry.geometry
        })
      }
    }
  }
  
  // give uniforms
  public render({ uniforms = {} }:RenderParams) {
    if (!this.visible) return

    if (this.material) {
      Object.assign(uniforms, this.material.getUniforms())
      // console.log(uniforms)
      for (const key in uniforms) {
        (this.model as any).uniforms[key] =uniforms[key]
      }
      this.checkModelMatrix(this.model)
      this.model.draw()
    } else {
      Object.assign(uniforms, this.fill.getUniforms())
      // console.log(uniforms)
      for (const key in uniforms) {
        (this.fillModel as any).uniforms[key] =uniforms[key]
      }
      this.checkModelMatrix(this.fillModel)
      this.fillModel.draw()
    }
  }

  private checkModelMatrix(model:Model) {
    if (this.geometry.matrixNeedRefresh) {
      const ax = 0.5 // anchor x
      const ay = 0.5
      const w = this.geometry.bound.width
      const h = this.geometry.bound.height
      const sx = 1 // scale x
      const sy = 1
      const sina = Math.sin(this.geometry.rotate)
      const cosa = Math.cos(this.geometry.rotate)
      const matrixArray:Length16Array = [
        sx * cosa, sx * -sina, 0, 0,
        sy * sina, sy * cosa, 0, 0,
        0, 0, 1, 0,
        this.geometry.x, this.geometry.y, 0, 1
      ]
      if (this.modelMatrix) {
        this.modelMatrix.set(...matrixArray)
      } else {
        this.modelMatrix = new Matrix4(matrixArray)
      }
    }
    (model as any).uniforms.u_modelMatrix = this.modelMatrix
  }

  public destroy() {
    this.subscriber = null
    this.geometry.destroy()
    this.geometry = null
    if (this.material) {
      this.material.destroy()
      this.material = null
      this.model.delete()
      this.model = null
    }
    if (this.fill) {
      this.fill.destroy()
      this.fill = null
      this.fillModel.delete()
      this.fillModel = null
    }
    if (this.stroke) {
      this.stroke.destroy()
      this.stroke = null
      this.strokeModel.delete()
      this.strokeModel = null
    }
    if (this.modelMatrix) this.modelMatrix = null
  }
}
