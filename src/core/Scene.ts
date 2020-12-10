import { Leaflike, Treelike } from '../utils/abstract/index'
import { Renderer } from './Renderer'

declare interface SceneInitConifg {
  canvas?: HTMLCanvasElement
}

export class Scene extends Treelike {
  public canvas: HTMLCanvasElement
  public renderer:Renderer
  constructor({ canvas }: SceneInitConifg) {
    super()
    this.canvas = canvas
    this.renderer = new Renderer({ canvas })
  }

  public add(child:Leaflike):number {
    const index = super.add(child)

    return index
  }
}
