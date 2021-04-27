import { BaseGeometry } from './BaseGeometry'
import { PWPoint, Point } from '@/common'
import { Vector2 } from 'math.gl'

export interface LineGeometryShapeConfig {
  type?: string
  start: Point
  end: Point
  thickness: number
}

// 矩形几何类型
export class LineGeometry extends BaseGeometry {
  public config:LineGeometryShapeConfig

  constructor(config:LineGeometryShapeConfig) {
    super(config)
  }

  public _refreshConfig(config:LineGeometryShapeConfig) {
    this.geometryNeedRefresh = true
    super._refreshConfig(config)

    if (!this.config) this.config = Object.assign({}, config)
    else Object.assign(this.config, config)
  }

  public _generatePoints() {
    const { thickness, start, end } = this.config
    this.length = Math.hypot(end.x - start.x, end.y - start.y)

    // 对于一个向量(x, y)垂直于它的向量是(-y, x)顺时针 (y, -x)逆时针
    const director = new Vector2(start.y - end.y, end.x - start.x).normalize()
    // 由于在shader中我们将y翻转了（成了更加合适2d的左上角坐标系），所以这里是一个逆时针的顺序（否则翻转之后，所有三角形会变成反面，而我们做了背面剔除，因此要这么做）
    const p1:PWPoint = { x: end.x + director.x * thickness * 0.5, y: end.y + director.y * thickness * 0.5, z: 0, w: this.length }
    const p2:PWPoint = { x: end.x - director.x * thickness * 0.5, y: end.y - director.y * thickness * 0.5, z: 0, w: this.length }
    const p3:PWPoint = { x: start.x - director.x * thickness * 0.5, y: start.y - director.y * thickness * 0.5, z: 0, w: 0 }
    const p4:PWPoint = { x: start.x + director.x * thickness * 0.5, y: start.y + director.y * thickness * 0.5, z: 0, w: 0 }

    this.points.splice(0, this.points.length, p1, p2, p3, p4)

    // uvs
    const p1UV:Point = { x: 1, y: 1 }
    const p2UV:Point = { x: 1, y: 0 }
    const p3UV:Point = { x: 0, y: 0 }
    const p4UV:Point = { x: 0, y: 1 }
    
    this.uvs.splice(0, this.uvs.length, p1UV, p2UV, p3UV, p4UV)

    return { width: 0, height: 0 }
  }
}