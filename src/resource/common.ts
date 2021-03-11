import { Dictionary } from '@/common'

export type AssetGroup = Dictionary<string>

export type Assets = Dictionary<string|AssetGroup>

export type LoadedAssets = Dictionary<HTMLImageElement>

export type LoadedAssetsGroup = Dictionary<HTMLImageElement | LoadedAssets>