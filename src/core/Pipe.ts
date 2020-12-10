import { Texture2D, loadImage } from '@luma.gl/webgl'
import { StringDictionary, AnyDictionary, GLContext, ImageSource } from '@/common'

declare interface PipeStage {

}

declare interface PipeConfig {
  gl: GLContext,
  stages: Array<PipeStage>,
  textures?: StringDictionary,
  autoUpdate: boolean
}

export class Pipe {
  public autoUpdate: boolean
  public pools:AnyDictionary = {}

  private gl: GLContext
  private stages: Array<PipeStage>
  private needUpdate: boolean
  private assetsReady: boolean

  constructor({ gl, stages = [], textures = {}, autoUpdate = false }:PipeConfig) {
    this.stages = stages
    this.gl = gl
    
    this.autoUpdate = autoUpdate
    this.needUpdate = autoUpdate

    this.init()
    this.createTexture(textures)
  }

  private init() {
    for (const stage of this.stages) {

    }
  }

  // 根据传入的资源链接对象，生成对应的贴图资源
  private createTexture(textures:StringDictionary) {
    const resources:Array<ImageSource> = []
    for (const key in textures) {
      const promise = loadImage(textures[key])
      const texture = new Texture2D(this.gl, { data: promise })
      this.pools[key] = texture
      resources.push({ key, promise })
    }
    
    if (resources.length === 0) {
      this.assetsReady = true
      return
    }
    
    Promise
      .all(resources.map((item) => item.promise))
      .then(() => {
        this.assetsReady = true
      })
  }
}
