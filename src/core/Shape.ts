import { Leaflike, constantValue } from '../utils'
import { Geometrys, GeometryType, GeometryConfig } from '../geometry/index'
import { Materials, MaterialType, MaterialConfig } from '../material/index'
import { GLContext } from '@/common'
import { Model } from '@luma.gl/engine'
import { RenderParams } from './Scene'
import { Matrix4 } from 'math.gl'

interface ShapeConfig {
  name?:string
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
  public get x() { return this.geometry.x }
  public set y(y:number) { this.geometry.y = y }
  public get y() { return this.geometry.y }

  constructor({ name, geometry, material }:ShapeConfig) {
    super({ name })

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
    this.geometry = new Geometrys[geometry.type](geometry.config)
    this.material = new Materials[material.type](material.config)

    const is2:boolean = (this.gl as any)._version === 2
    this.model = new Model(this.gl, {
      vs: is2 ? `#version 300 es
        layout (location = 0) in vec4 positions;

        uniform mat4 u_resolutionMatrix;
        uniform mat4 u_modelMatrix;

        out vec2 v_uv;

        void main() {
          gl_Position = vec4((u_resolutionMatrix * u_modelMatrix * vec4(positions.xyz, f1)).xyz, f1);
          v_uv = gl_Position.xy * fhalf + fhalf;
        }
      ` : `
        attribute vec3 positions;

        uniform mat4 u_resolutionMatrix;
        uniform mat4 u_modelMatrix;

        varying vec2 v_uv;

        void main() {
          gl_Position = vec4((u_resolutionMatrix * u_modelMatrix * vec4(positions.xyz, f1)).xyz, f1);
          v_uv = gl_Position.xy * fhalf + fhalf;
        }
      `,
      fs: is2 ? `#version 300 es
        
        in vec2 v_uv;

        out vec4 fragColor;

        void main() {
          fragColor = vec4(v_uv.x, f0, f0, f1);
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
        u_resolution: [1, 1]
      }),
      modules: [constantValue],
      geometry: this.geometry.geometry
    })
  }
  
  // give uniforms
  public render({ uniforms = {} }:RenderParams) {
    // console.log(uniforms)
    for (const key in uniforms) {
      (this.model as any).uniforms[key] =uniforms[key]
    }
    this.checkModelMatrix()

    this.model.draw()
  }

  private checkModelMatrix() {
    if (this.geometry.matrixNeedRefresh) {
      if (this.modelMatrix) {
        this.modelMatrix.set(
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          this.geometry.x, this.geometry.y, 0, 1
        )
      } else {
        this.modelMatrix = new Matrix4([
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          this.geometry.x, this.geometry.y, 0, 1
        ])
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
