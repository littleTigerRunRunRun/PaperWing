import { RectGeometry } from './RectGeometry'
import { LineGeometry } from './LineGeometry'

export type GeometryType = RectGeometry | LineGeometry

export function getGeometry(config:GeometryConfig):GeometryType {
  switch(config.type) {
    case 'rect': return new RectGeometry(config as RectGeometryShapeConfig);
    case 'line': return new LineGeometry(config as LineGeometryShapeConfig); break
  }
  throw new Error(`shape get geometry with no such type: ${config.type}`)
}
