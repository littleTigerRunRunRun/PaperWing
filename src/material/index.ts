import { PureColorMaterial, PureColorMaterialConfig } from './PureColorMaterial'
import { Texture2DMaterial, Texture2DMaterialConfig } from './Texture2DMaterial'

export type MaterialType = PureColorMaterial | Texture2DMaterial

export type MaterialConfig = PureColorMaterialConfig | Texture2DMaterialConfig

export function getMaterial(config:MaterialConfig) {
  let prototype
  switch(config.type) {
    case 'pure': prototype = PureColorMaterial; break
    case 'texture2d': prototype = Texture2DMaterial; break
  }
  return new prototype(config)
}