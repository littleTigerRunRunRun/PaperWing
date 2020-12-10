export declare interface RectGeometryShapeConfig {
  x?: number
  y?: number
  width: number
  height: number 
}

declare interface RectGeometryConfig {
  config: RectGeometryShapeConfig
}


export class RectGeometry {
  constructor({
    config
  }: RectGeometryConfig) {
    const { x = 0, y = 0, width, height } = config
    console.log(x, y, width, height)
  }
}