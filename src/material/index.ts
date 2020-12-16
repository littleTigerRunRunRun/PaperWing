import { PureColorMaterial, PureColorMaterialConfig } from './PureColorMaterial'

export const Materials = {
  pure: PureColorMaterial
}

export type MaterialType = PureColorMaterial

export type MaterialConfig = { type: 'pure', config: PureColorMaterialConfig }