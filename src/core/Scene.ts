import { Leaflike, Treelike } from '../utils/abstract/index'
import { Renderer } from './Renderer'
import { Loop, AnimationLoopStartOptions } from './Loop'
import PWEvent from './Event'

declare interface SceneInitConifg {
  canvas?: HTMLCanvasElement
  options: AnimationLoopStartOptions
}

export class Scene extends Treelike {
  public canvas: HTMLCanvasElement
  public renderer:Renderer
  private loop:Loop
  
  constructor({ canvas, options = {} }: SceneInitConifg) {
    super()
    this.canvas = canvas
    this.renderer = new Renderer({ canvas })
    this.loop = new Loop({ canvas, options })
  }

  public add(child:Leaflike):number {
    const index = super.add(child)

    return index
  }

  // 外部监听一些内部事件
  public listen(eventName:string, callback:Function) {
    PWEvent.listen(eventName, callback)
  }
}
