import { Leaflike } from '../utils/abstract/index'
import { Geometrys, GeometryType, GeometryConfig } from '../geometry/index'
import { Materials, MaterialType, MaterialConfig } from '../material/index'
import PWSubscriber from './Subscriber'
import { GLContext } from '@/common'
import { Model } from '@luma.gl/engine'

interface ShapeConfig {
  name?:string
  geometry:GeometryConfig,
  material:MaterialConfig
}

export class Shape extends Leaflike {
  public geometry:GeometryType
  public material:MaterialType
  public gl:GLContext
  private geometryConfig:GeometryConfig
  private materialConfig:MaterialConfig

  constructor({ name, geometry, material }:ShapeConfig) {
    super({ name })

    this.geometryConfig = geometry
    this.materialConfig = material
    PWSubscriber.once('getGl', this.getGl)
  }

  private getGl = (gl:GLContext) => {
    this.gl = gl
    this.init(this.geometryConfig, this.materialConfig)
  }

  private init(geometry:GeometryConfig, material:MaterialConfig) {
    console.log(this.gl)
    this.geometry = new Geometrys[geometry.type](geometry.config)
    this.material = new Materials[material.type](material.config)
    // this.model = new Model()
  }
  
  render() {
    // console.log('render rect geometry')
  }

  destroy() {
    
  }
}
