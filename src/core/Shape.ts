import { Leaflike, constantValue } from '../utils'
import { Geometrys, GeometryType, GeometryConfig } from '../geometry/index'
import { Materials, MaterialType, MaterialConfig } from '../material/index'
import { GLContext } from '@/common'
import { Model, PlaneGeometry } from '@luma.gl/engine'

interface ShapeConfig {
  name?:string
  geometry:GeometryConfig,
  material:MaterialConfig
}

export class Shape extends Leaflike {
  public geometry:GeometryType
  public material:MaterialType
  public model:Model
  public gl:GLContext
  private geometryConfig:GeometryConfig
  private materialConfig:MaterialConfig

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

        uniform vec2 u_resolution;

        out vec2 v_uv;

        void main() {
          v_uv = positions.xy * fhalf + fhalf;
          gl_Position = vec4(positions.xyz, f1);
        }
      ` : `
        attribute vec3 positions;

        uniform vec2 u_resolution;

        varying vec2 v_uv;

        void main() {
          v_uv = positions.xy * fhalf + fhalf;
          gl_Position = vec4(positions.xyz, f1);
        }
      `,
      fs: is2 ? `#version 300 es
        
        out vec4 fragColor;

        void main() {
          fragColor = vec4(f1, f0, f0, f0);
        }
      ` : `
        void main() {
          gl_FragColor = vec(f1, f0, f0, f0);
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
  
  render() {
    // console.log('render rect geometry')
  }

  destroy() {
    this.subscriber = null
    this.geometry.destroy()
    this.geometry = null
    this.material.destroy()
    this.material = null
  }
}
