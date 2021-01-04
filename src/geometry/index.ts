import { RectGeometry, RectGeometryShapeConfig } from './RectGeometry'
import { LineGeometry, LineGeometryShapeConfig } from './LineGeometry'

export type GeometryType = RectGeometry | LineGeometry

export type GeometryConfig = RectGeometryShapeConfig | LineGeometryShapeConfig

export function getGeometry(config:GeometryConfig) {
  let prototype
  switch(config.type) {
    case 'rect': prototype = RectGeometry; break
    case 'line': prototype = LineGeometry; break
  }
  return new prototype(config)
}