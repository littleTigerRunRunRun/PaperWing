import { Leaflike, Treelike } from '../utils/abstract/index'
import { mixin } from '../utils/mixin'
import { Renderer } from './Renderer'
import { RenderLoop, AnimationLoopStartOptions, RenderLoopCarrier } from './RenderLoop'
import PWSubscriber from './Subscriber'

interface SceneInitConifg {
  canvas?: HTMLCanvasElement
  options?: AnimationLoopStartOptions
}

// export interface ListenGL {
//   get():GLContext
// }

interface SceneChild extends Leaflike {
  render()
}

// 将RenderLoopCarrier这个扩展混合进Treelike
class SceneTreelike extends Treelike {}
interface SceneTreelike extends RenderLoopCarrier {}
mixin(SceneTreelike, [RenderLoopCarrier])

export class Scene extends SceneTreelike {
  public canvas: HTMLCanvasElement
  public renderer:Renderer
  public children:Array<SceneChild> = []
  
  constructor({ canvas, options = {} }: SceneInitConifg) {
    super()
    this.canvas = canvas
    this.loop = new RenderLoop({ canvas, options })
    this.renderer = new Renderer({ scene: this })
  }

  public add(child:SceneChild):number {
    const index = super.add(child)

    return index
  }

  public destroy() {
    PWSubscriber.clear()
  }
}
