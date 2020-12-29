import { RectGeometry, RectGeometryShapeConfig } from './RectGeometry'
import { LineGeometry, LineGeometryShapeConfig } from './LineGeometry'
import { Geometry } from '@luma.gl/engine'

export type GeometryType = RectGeometry | LineGeometry

export type GeometryConfig = 
  { type:'rect', config:RectGeometryShapeConfig } | 
  { type:'line', config:LineGeometryShapeConfig }

export function getGeometry(config:GeometryConfig) {
  let prototype
  switch(config.type) {
    case 'rect': prototype = RectGeometry; break
    case 'line': prototype = LineGeometry; break
  }
  return new prototype(config.config)
}