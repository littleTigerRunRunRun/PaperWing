import { PureColorMaterial } from './PureColorMaterial'
import { Texture2DMaterial } from './Texture2DMaterial'
import { StandardMaterial } from './StandardMaterial'

export declare type MaterialType = PureColorMaterial | Texture2DMaterial | StandardMaterial

export function getMaterial(config:MaterialConfig):MaterialType {
  switch(config.type) {
    case 'pure': return new PureColorMaterial(config as PureColorMaterialConfig)
    case 'texture2d': return new Texture2DMaterial(config as Texture2DMaterialConfig)
    case 'standard': return new StandardMaterial(config as StandardMaterialConfig)
  }
  throw new Error(`shape get material with no such type: ${config.type}`)
}