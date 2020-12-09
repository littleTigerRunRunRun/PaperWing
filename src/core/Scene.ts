import { mixin, Treelike } from '../utils/abstract/index'

declare interface SceneInitConifg {
  canvas?: HTMLCanvasElement
}

export class Scene {
  canvas: HTMLCanvasElement
  constructor({ canvas }: SceneInitConifg) {
    this.canvas = canvas
  }
}

mixin(Scene, [Treelike])