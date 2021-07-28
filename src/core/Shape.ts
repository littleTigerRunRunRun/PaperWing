import { Leaflike, constantValue, GetSetNumber, GetSetSize, BuildMatrixManager2D, SignClassTypeName } from '../utils' // , GetSetRenderOrder
import { getGeometry, GeometryType } from '../geometry/index'
import { getMaterial, MaterialType } from '../material/index'
import { Model } from '@luma.gl/engine'
import { setParameters } from '@luma.gl/gltools'
import { Matrix4 } from 'math.gl'

declare interface ShapeConfig {
  name?:string
  visible?:boolean
  geometry:GeometryConfig,
  material?:MaterialConfig // 3d的概念里面更多用material
  fill?:MaterialConfig // 2d的概念里往往需要分成fill和stroke处理
  stroke?:MaterialConfig
}

export interface Shape extends GetSetSize, MatrixManager2D, ClassTypeName {}

@BuildMatrixManager2D()
@SignClassTypeName('shape')
@GetSetNumber('width', 0)
@GetSetNumber('height', 0)
export class Shape extends Leaflike {
  public itemId:number = -1

  public gl?:GLContext
  public geometry?:GeometryType
  public modelMatrix?:Matrix4

  public model?:Model
  public material?:MaterialType
  public fill?:MaterialType
  public stroke?:MaterialType
  public fillModel?:Model
  public strokeModel?:Model

  private materialConfig:MaterialConfig|undefined
  private fillConfig:MaterialConfig|undefined
  private strokeConfig:MaterialConfig|undefined
  
  private _visible:boolean = true
  public get visible() { return this._visible }
  public set visible(visible:boolean) { this._visible = visible }

  constructor({ name, geometry, material, fill, stroke, visible = true }:ShapeConfig) {
    super({ name })

    this.visible = visible
    this.materialConfig = material
    this.fillConfig = fill
    this.strokeConfig = stroke

    this.geometry = getGeometry(geometry)
    this.width = this.geometry.width
    this.height = this.geometry.height
  }

  public setSubscriber(subscriber:PaperWingSubscriber) {
    super.setSubscriber(subscriber)
    this.itemId = subscriber.get('itemId')
    subscriber.set('itemId', this.itemId + 1)

    this.subscriber?.once('getGl', this.getGl)
  }

  private getGl = (gl:GLContext) => {
    this.gl = gl
    this.init(this.materialConfig, this.fillConfig, this.strokeConfig)
  }

  private init(material:MaterialConfig|undefined, fill:MaterialConfig|undefined, stroke:MaterialConfig|undefined) {
    if (!this.subscriber) throw new Error('shape init but no subscriber')
    if (!this.geometry) throw new Error('shape init but no geometry')
    if (!this.gl) throw new Error('shape init but no gl')

    if (material) this.material = getMaterial(material)
    if (fill) this.fill = getMaterial(fill)
    if (stroke) this.stroke = getMaterial(stroke)

    const is2:boolean = (this.gl as any)._version === 2

    if (this.material) {
      const receipt = this.material.getReceipt(is2, this.gl, this.subscriber)
      this.model = new Model(this.gl, {
        vs: receipt.vs,
        fs: receipt.fs,
        defines: receipt.defines,
        uniforms: Object.assign({
        }, receipt.uniforms),
        modules: [constantValue],
        geometry: this.geometry.geometry
      })
    } else {
      if (this.fill) {
        const fillReceipt = this.fill.getReceipt(is2, this.gl, this.subscriber)
        this.fillModel = new Model(this.gl, {
          vs: fillReceipt.vs,
          fs: fillReceipt.fs,
          defines: fillReceipt.defines,
          uniforms: Object.assign({
          }, fillReceipt.uniforms),
          modules: [constantValue],
          geometry: this.geometry.geometry
        })
      }
      if (this.stroke) {
        const strokeReceipt = this.stroke.getReceipt(is2, this.gl, this.subscriber)
        this.strokeModel = new Model(this.gl, {
          vs: strokeReceipt.vs,
          fs: strokeReceipt.fs,
          defines: strokeReceipt.defines,
          uniforms: Object.assign({
          }, strokeReceipt.uniforms),
          modules: [constantValue],
          geometry: this.geometry.strokeGeometry
        })
      }
    }
  }
  
  // give uniforms
  public render(argus?:RenderParams) {
    if (!this.geometry) throw new Error('shape render but no geometry')
    if (!this.gl) throw new Error('shape render but no gl')
    const { uniforms = {}, framebuffer = null } = (argus || {})

    if (!this.visible) return
    if (!this.gl) {
      console.error('no gl ready for shape render!')
      return
    }
    if (this.needRefreshMatrix) this.computeMatrix()

    const drawTarget = { framebuffer } // framebuffer
    setParameters(this.gl, {
      blend: true
    })

    if (this.geometry.geometryNeedRefresh) this.geometry._refreshGeometry()

    if (this.material && this.model) {
      if (this.geometry.geometryNeedRefresh) {
        this.model.setGeometry(this.geometry.geometry)
      }

      Object.assign(uniforms, this.material.getUniforms())
      for (const key in uniforms) {
        (this.model as any).uniforms[key] = uniforms[key]
      }
      (this.model as any).uniforms.u_modelMatrix = this._matrix
      this.model.draw(drawTarget)
    }
    if (this.fill && this.fillModel) {
      if (this.geometry.geometryNeedRefresh) this.fillModel.setGeometry(this.geometry.geometry)
      
      const fillUniforms = Object.assign({}, uniforms, this.fill.getUniforms())
      for (const key in fillUniforms) {
        (this.fillModel as any).uniforms[key] = fillUniforms[key]
      }
      (this.fillModel as any).uniforms.u_modelMatrix = this._matrix
      this.fillModel.draw(drawTarget)
    }
    if (this.stroke && this.strokeModel) {
      if (this.geometry.geometryNeedRefresh) {
        this.strokeModel.setGeometry(this.geometry.strokeGeometry)
      }

      const strokeUniforms = Object.assign({}, uniforms, this.stroke.getUniforms())
      for (const key in strokeUniforms) {
        (this.strokeModel as any).uniforms[key] = strokeUniforms[key]
      }
      (this.strokeModel as any).uniforms.u_modelMatrix = this._matrix
      this.strokeModel.draw(drawTarget)
    }

    this.geometry.geometryNeedRefresh = false
  }

  public refreshGeometry(config?:any) {
    if (!this.subscriber) {
      console.error('你不能在shape被添加为子元素前就调用refreshGeometry')
      return
    }

    const scene = this.subscriber.get('scene');
    (scene as any).addFrameCompute(`refreshGeometry_${this.itemId}`, { callback: this.geometry!._refreshGeometry, before: true, params:[config] })
  }

  // onRenderOrderChange(order:number) {
  //   this.geometry.config.renderOrder = order
  //   this.refreshGeometry()
  // }

  // private checkModelMatrix(model:Model) {
  //   if (this.geometry.matrixNeedRefresh) {
  //     const ax = 0.5 // anchor x
  //     const ay = 0.5
  //     const w = this.geometry.width
  //     const h = this.geometry.height
  //     const sx = 1 // scale x
  //     const sy = 1
  //     const sina = Math.sin(this.geometry.rotate)
  //     const cosa = Math.cos(this.geometry.rotate)
  //     const matrixArray:Length16NumberArray = [
  //       sx * cosa, sx * -sina, 0, 0,
  //       sy * sina, sy * cosa, 0, 0,
  //       0, 0, 1, 0,
  //       this.geometry.x, this.geometry.y, 0, 1
  //     ]
  //     if (this.modelMatrix) {
  //       this.modelMatrix.set(...matrixArray)
  //     } else {
  //       this.modelMatrix = new Matrix4(matrixArray)
  //     }
  //   }
  //   (model as any).uniforms.u_modelMatrix = this.modelMatrix
  // }

  onWidthChange(width:number) {
    if (!this.geometry) throw new Error('change width but no geometry')
    this.geometry.width = width
  }

  onHeightChange(height:number) {
    if (!this.geometry) throw new Error('change height but no geometry')
    this.geometry.height = height
  }
  
  public destroy() {
    this.geometry?.destroy()
    this.geometry = undefined
    this.subscriber = undefined
    if (this.material) {
      this.material.destroy()
      this.material = undefined
      this.model?.delete()
      this.model = undefined
    }
    if (this.fill) {
      this.fill.destroy()
      this.fill = undefined
      this.fillModel?.delete()
      this.fillModel = undefined
    }
    if (this.stroke) {
      this.stroke.destroy()
      this.stroke = undefined
      this.strokeModel?.delete()
      this.strokeModel = undefined
    }
    if (this.modelMatrix) this.modelMatrix = undefined
  }
}
