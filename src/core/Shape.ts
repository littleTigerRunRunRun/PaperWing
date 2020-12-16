import { Leaflike } from '../utils/abstract/index'
import { Geometrys, GeometryType, GeometryConfig } from '../geometry/index'

interface ShapeConfig {
  name?: string
  geometry: GeometryConfig
}

export class Shape extends Leaflike {
  public geometry: GeometryType
  constructor({ geometry, name }:ShapeConfig) {
    super({ name })

    this.initGeometry(geometry)
  }

  private initGeometry(geometry:GeometryConfig) {
    this.geometry = new Geometrys[geometry.type]({
      config: geometry.config
    }) 
  }
  
  render() {
    // console.log('render rect geometry')
  }

  destroy() {
    
  }
}
