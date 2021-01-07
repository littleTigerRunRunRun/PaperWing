import { BaseGeometry } from './BaseGeometry'
import { PWPoint, Point } from '@/common'
import { Vector2 } from 'math.gl'

export interface LineGeometryShapeConfig {
  type?: string
  start: Point
  end: Point
  width: number
}

// 矩形几何类型
export class LineGeometry extends BaseGeometry {
  public config:LineGeometryShapeConfig

  constructor(config:LineGeometryShapeConfig) {
    super(config)
  }

  public _refreshConfig(config:LineGeometryShapeConfig) {
    super._refreshConfig(config)

    if (!this.config) this.config = Object.assign({}, config)
    else Object.assign(this.config, config)
  }

  public _generatePoints() {
    const { width, start, end } = this.config
    this.length = Math.hypot(end.x - start.x, end.y - start.y)

    const director = new Vector2(start.y - end.y, end.x - start.x).normalize()
    const p1:PWPoint = { x: start.x + director.x * width * 0.5, y: start.y + director.y * width * 0.5, z: 0, w: 0 }
    const p2:PWPoint = { x: start.x - director.x * width * 0.5, y: start.y - director.y * width * 0.5, z: 0, w: 0 }
    const p3:PWPoint = { x: end.x - director.x * width * 0.5, y: end.y - director.y * width * 0.5, z: 0, w: this.length }
    const p4:PWPoint = { x: end.x + director.x * width * 0.5, y: end.y + director.y * width * 0.5, z: 0, w: this.length }

    this.points.splice(0, this.points.length, p1, p2, p3, p4)

    return { width: 0, height: 0 }
  }
}