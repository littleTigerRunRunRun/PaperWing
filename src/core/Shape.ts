import { Leaflike, constantValue } from '../utils'
import { getGeometry, GeometryType, GeometryConfig } from '../geometry/index'
import { Materials, MaterialType, MaterialConfig } from '../material/index'
import { GLContext, Length16Array } from '@/common'
import { Model } from '@luma.gl/engine'
import { RenderParams } from './Scene'
import { Matrix4 } from 'math.gl'

interface ShapeConfig {
  name?:string
  visible?:boolean
  geometry:GeometryConfig,
  material:MaterialConfig
}

export class Shape extends Leaflike {
  public geometry:GeometryType
  public material:MaterialType
  public model:Model
  public modelMatrix:Matrix4
  public gl:GLContext
  private geometryConfig:GeometryConfig
  private materialConfig:MaterialConfig

  public set x(x:number) { this.geometry.x = x }
  public get x():number { return this.geometry.x }
  public set y(y:number) { this.geometry.y = y }
  public get y():number { return this.geometry.y }
  public set rotate(rotate:number) { this.geometry.rotate = rotate }
  public get rotate():number { return this.geometry.rotate }
  
  private _visible:boolean
  get visible() { return this._visible }
  set visible(visible:boolean) { this._visible = visible }

  constructor({ name, geometry, material, visible = true }:ShapeConfig) {
    super({ name })

    this.visible = visible
    this.geometryConfig = geometry
    this.materialConfig = material
  }

  public setSubscriber(subscriber) {
    super.setSubscriber(subscriber)
    
    this.subscriber.once('getGl', this.getGl)
  }

  private getGl = (gl:GLContext) => {
    this.gl = gl
    this.init(this.geometryConfig, this.materialConfig)
  }

  private init(geometry:GeometryConfig, material:MaterialConfig) {
    this.geometry = getGeometry(geometry)
    this.material = new Materials[material.type](material.config)

    const is2:boolean = (this.gl as any)._version === 2
    this.model = new Model(this.gl, {
      vs: is2 ? `#version 300 es
        layout (location = 0) in vec4 positions;

        uniform mat4 u_projectionMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_modelMatrix;

        out vec2 v_uv;

        void main() {
          gl_Position = vec4((u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(positions.xyz, f1)).xyz, f1);
          v_uv = gl_Position.xy * fhalf + fhalf;
        }
      ` : `
        attribute vec3 positions;

        uniform mat4 u_projectionMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_modelMatrix;

        varying vec2 v_uv;

        void main() {
          gl_Position = vec4((u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(positions.xyz, f1)).xyz, f1);
          v_uv = gl_Position.xy * fhalf + fhalf;
        }
      `,
      fs: is2 ? `#version 300 es
        
        in vec2 v_uv;

        out vec4 fragColor;

        void main() {
          fragColor = vec4(v_uv.xy, f0, f1);
        }
      ` : `
        varying vec2 v_uv;

        void main() {
          gl_FragColor = vec(v_uv, f0, f1);
        }
      `,
      defines: {

      },
      uniforms: Object.assign({
      }),
      modules: [constantValue],
      geometry: this.geometry.geometry
    })
  }
  
  // give uniforms
  public render({ uniforms = {} }:RenderParams) {
    if (!this.visible) return
    // console.log(uniforms)
    for (const key in uniforms) {
      (this.model as any).uniforms[key] =uniforms[key]
    }
    this.checkModelMatrix()

    this.model.draw()
  }

  private checkModelMatrix() {
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
    (this.model as any).uniforms.u_modelMatrix = this.modelMatrix
  }

  public destroy() {
    this.subscriber = null
    this.geometry.destroy()
    this.geometry = null
    this.material.destroy()
    this.material = null
    if (this.modelMatrix) this.modelMatrix = null
  }
}
