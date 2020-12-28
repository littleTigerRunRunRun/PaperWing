import { BaseGeometry } from './BaseGeometry'
import { PWPoint } from '@/common'

export interface RectGeometryShapeConfig {
  x?: number
  y?: number
  width: number
  height: number
  stroke?: number
}

// 矩形几何类型
export class RectGeometry extends BaseGeometry {
  public config:RectGeometryShapeConfig

  constructor(config:RectGeometryShapeConfig) {
    super(config)
  }

  public refreshConfig(config:RectGeometryShapeConfig) {
    super.refreshConfig(config)

    if (!this.config) this.config = Object.assign({}, config)
    else Object.assign(this.config, config)
  }

  public generatePoints() {
    const { width, height } = this.config

    const p1:PWPoint = { x: 0, y: 0, z: 0, w: 0 }
    const p2:PWPoint = { x: width, y: 0, z: 0, w: width }
    const p3:PWPoint = { x: width, y: height, z: 0, w: width + height }
    const p4:PWPoint = { x: 0, y: height, z: 0, w: width * 2 + height }

    this.length = width * 2 + height * 2
    this.points.splice(0, this.points.length, p1, p2, p3, p4)
  }
}