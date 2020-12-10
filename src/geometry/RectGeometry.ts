export declare interface RectGeometryConfig {
  x?: number
  y?: number
  width: number
  height: number 
}

export class RectGeometry {
  constructor({ x = 0, y = 0, width, height }:RectGeometryConfig) {
    console.log(x, y, width, height)
  }
}