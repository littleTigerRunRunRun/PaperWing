import { BaseGeometry } from './BaseGeometry'

// 矩形几何类型
export class RectGeometry extends BaseGeometry {
  constructor(config:RectGeometryShapeConfig) {
    super(config)
  }

  public onWidthChange(width:number) {
    this.config.width = width
    this.geometryNeedRefresh = true
  }

  public onHeightChange(height:number) {
    this.config.height = height
    this.geometryNeedRefresh = true
  }

  public _refreshConfig(config:RectGeometryShapeConfig) {
    super._refreshConfig(config)

    this._width = config.width
    this._height = config.height

    if (!this.config) this.config = Object.assign({}, config)
    else Object.assign(this.config, config)
  }

  public _generatePoints() {
    const { width, height, stroke = 0 } = this.config
    this.stroke = stroke

    const p1:PWPoint = { x: width * -0.5, y: height * 0.5, z: 0, w: width * 2 + height }
    const p2:PWPoint = { x: width * 0.5, y: height * 0.5, z: 0, w: width + height }
    const p3:PWPoint = { x: width * 0.5, y: height * -0.5, z: 0, w: width }
    const p4:PWPoint = { x: width * -0.5, y: height * -0.5, z: 0, w: 0 }

    this.length = width * 2 + height * 2
    this.points.splice(0, this.points.length, p1, p2, p3, p4)

    // uvs
    const p1UV:Point = { x: 0, y: 1 }
    const p2UV:Point = { x: 1, y: 1 }
    const p3UV:Point = { x: 1, y: 0 }
    const p4UV:Point = { x: 0, y: 0 }
    this.uvs.splice(0, this.uvs.length, p1UV, p2UV, p3UV, p4UV)

    return { width, height }
  }
}