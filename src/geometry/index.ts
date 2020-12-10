import { RectGeometry, RectGeometryConfig } from './RectGeometry'

export const Geometrys = {
  rect: RectGeometry
}

export type GeometryType = RectGeometry

export type GeometryConfig = { type: 'rect', config: RectGeometryConfig }