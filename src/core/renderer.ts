import { Scene } from './Scene'
import { GLContext } from '@/common'
import { clear } from '@luma.gl/webgl'
import Stats from 'stats.js'

interface RendererConfig {
  scene:Scene
  stats:boolean
}

// viewport 控制
export class Renderer {
  private scene:Scene
  private gl:GLContext
  private stats:Stats

  constructor({ scene, stats }:RendererConfig) {
    this.scene = scene
    if (stats) {
      this.stats = new Stats()
      document.body.appendChild(this.stats.dom)
    }

    this.scene.tick(this.tick)
    this.scene.once('getGl', this.getGl)
  }

  private getGl = (gl:GLContext) => {
    this.gl = gl
  }

  public clear() {
    clear(this.gl, { color: [0, 0, 0, 1], depth: true })
  }

  private tick = () => {
    if (!this.gl) return
    if (this.stats) this.stats.update()
    // this.clear()
    const viewer = this.scene.viewer

    // 这里的child可以是group、shape和particle
    // shape和particle属于带有model的绘制，而group属于
    this.scene.children.forEach((child) => child.render({
      uniforms: {
        u_resolutionMatrix: viewer.computeResolutionMatrix(this.gl.drawingBufferWidth, this.gl.drawingBufferHeight)
      }
    }))
  }

  public destroy() {
    if (this.stats) {
      document.body.removeChild(this.stats.dom)
      this.stats = null
    }
  }
}
