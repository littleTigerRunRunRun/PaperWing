import { Texture2D, loadImage } from '@luma.gl/webgl'
import { Dictionary, GLContext, ImageSource } from '@/common'
import { getGL } from './Loop'

declare interface PipeStage {

}

declare interface PipeConfig {
  gl: GLContext,
  stages: Array<PipeStage>,
  textures?: Dictionary<string>,
  autoUpdate: boolean
}

export class Pipe {
  public autoUpdate: boolean
  public textures:Dictionary<Texture2D> = {}
  
  private stages: Array<PipeStage>
  private needUpdate: boolean
  private assetsReady: boolean

  get gl():GLContext {
    return getGL()
  }

  constructor({ stages = [], textures = {}, autoUpdate = false }:PipeConfig) {
    this.stages = stages
    
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
  private createTexture(textures:Dictionary<string>) {
    const resources:Array<ImageSource> = []
    for (const key in textures) {
      const promise:Promise<HTMLImageElement> = loadImage(textures[key])
      const texture:Texture2D = new Texture2D(this.gl, { data: promise })
      this.textures[key] = texture
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

  // 渲染运行
  render() {
    if (this.needUpdate && this.assetsReady) {
      if (!this.autoUpdate) this.needUpdate = false
    }
  }
}
