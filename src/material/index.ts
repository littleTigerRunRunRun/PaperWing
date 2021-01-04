import { PureColorMaterial, PureColorMaterialConfig } from './PureColorMaterial'

export type MaterialType = PureColorMaterial

export type MaterialConfig = PureColorMaterialConfig

export function getMaterial(config:MaterialConfig) {
  let prototype
  switch(config.type) {
    case 'pure': prototype = PureColorMaterial; break
  }
  return new prototype(config)
}