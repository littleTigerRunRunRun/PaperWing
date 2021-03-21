import { childlike, Treelike } from '../utils'
import { Renderer } from './Renderer'
import { RenderLoop, AnimationLoopStartOptions, GLParams, makeRenderLoopCarrier, RenderLoopCarrier } from './RenderLoop'
import Subscriber from './Subscriber'
import { Dictionary, GLContext } from '@/common'
import { Viewer } from '../viewer'
import { Assets, Resource } from '../resource'
import { Framebuffer } from '@luma.gl/webgl'

interface SceneInitConifg {
  canvas?:HTMLCanvasElement
  stats?:boolean
  options?:AnimationLoopStartOptions
  glParams?:GLParams
  assets?:Assets
}

// export interface ListenGL {
//   get():GLContext
// }

export interface RenderParams {
  uniforms:Dictionary<any>
  framebuffer?:Framebuffer
}

// 将RenderLoopCarrier这个扩展混合进Treelike
export interface Scene extends RenderLoopCarrier {}
@makeRenderLoopCarrier
export class Scene extends Treelike {
  public canvas: HTMLCanvasElement
  public renderer:Renderer
  public viewer:Viewer
  public children:Array<childlike> = []
  public get is2() { return this.loop && this.loop.version === 2 }
  protected subscriber:Subscriber
  public getSubscriber() { return this.subscriber }
  public resource:Resource
  
  constructor({ canvas, options = {}, stats = false, glParams = {}, assets = null }: SceneInitConifg) {
    super()
    
    this.canvas = canvas
    this.subscriber = new Subscriber()
    this.subscriber.set('scene', this)
    this.subscriber.set('itemId', 0)

    this.resource = new Resource(this.subscriber, assets)

    this.loop = new RenderLoop({ canvas, subscriber: this.subscriber, options, glParams })

    this.renderer = new Renderer({ scene: this, stats })
  
    // 综合resouce和gl准备好的钩子
    this.subscriber.next('getGl', this.onGLGet)
    this.subscriber.once('progressEnd', this.onAssetsGet)
  }

  private onGLGet = () => {
    this.checkGLAndAssets()
  }

  private onAssetsGet = () => {
    this.checkGLAndAssets()
  }

  private checkCount:number = 0
  private checkGLAndAssets() {
    this.checkCount++
    if (this.checkCount === 2) {
      if (this._onReady) {
        this._onReady()
      }
    }
  }

  // 钩子：资源和gl都准备完毕
  private _onReady() {}
  public onReady(callback) {
    this._onReady = callback
  }

  public add(child:childlike):number {
    if (child.parent === this) return

    const index = super.add(child)
    child.setSubscriber(this.subscriber)

    return index
  }

  public destroy() {
    this.clearChildren()
    this.subscriber.clear()
    if (this.loop) this.loop.destroy()
    if (this.viewer) this.viewer.destroy()
    if (this.renderer) this.renderer.destroy()
  }
}
