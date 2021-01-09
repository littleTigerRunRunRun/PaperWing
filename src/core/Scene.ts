import { childlike, Treelike } from '../utils'
import { Renderer } from './Renderer'
import { RenderLoop, AnimationLoopStartOptions, GLParams, makeRenderLoopCarrier, RenderLoopCarrier } from './RenderLoop'
import Subscriber from './Subscriber'
import { Dictionary } from '@/common'
import { Viewer } from '../viewer'

interface SceneInitConifg {
  canvas?:HTMLCanvasElement
  stats?:boolean
  options?:AnimationLoopStartOptions
  glParams?:GLParams
}
// export interface ListenGL {
//   get():GLContext
// }

export interface RenderParams {
  uniforms:Dictionary<any>
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
  
  constructor({ canvas, options = {}, stats = false, glParams = {} }: SceneInitConifg) {
    super()
    
    this.canvas = canvas
    this.subscriber = new Subscriber()
    this.subscriber.set('scene', this)
    this.subscriber.set('itemId', 0)

    this.loop = new RenderLoop({ canvas, subscriber: this.subscriber, options, glParams })

    this.renderer = new Renderer({ scene: this, stats })
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
