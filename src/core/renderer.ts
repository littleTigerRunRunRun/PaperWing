import { Scene } from './Scene'

interface RendererConfig {
  scene:Scene
}

// viewport 控制
export class Renderer {
  private scene:Scene

  constructor({ scene }:RendererConfig) {
    this.scene = scene
    this.scene.tick(this.tick)
  }

  private tick = () => {
    // this.clear()

    this.scene.children.forEach((child) => child.render())
  }
}
