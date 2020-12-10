import { Leaflike } from '../utils/abstract/index'
import { Geometrys, GeometryType, GeometryConfig } from '../geometry/index'

declare interface ShapeConfig {
  geometry: GeometryConfig
}

export class Shape extends Leaflike {
  public geometry: GeometryType
  constructor({ geometry }:ShapeConfig) {
    super()

    this.initGeometry(geometry)
  }

  private initGeometry(geometry:GeometryConfig) {
    this.geometry = new Geometrys[geometry.type](geometry.config) 
  }
}
