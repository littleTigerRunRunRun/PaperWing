import { Scene } from './Scene'
import { clear } from '@luma.gl/webgl'
import Stats from 'stats.js'
import { isRenderable } from '../utils'
import { resizeGLContext } from '@luma.gl/gltools'

interface RendererConfig {
  scene:Scene
  stats:boolean
  autoTick?:boolean
}

// viewport 控制
export class Renderer {
  private scene:Scene
  private gl!:GLContext
  private stats!:Stats
  private autoTick:boolean
  public needRefresh:boolean = true

  constructor({ scene, stats, autoTick = true }:RendererConfig) {
    this.scene = scene
    if (stats) {
      this.stats = new Stats()
      document.body.appendChild(this.stats.dom)
    }

    this.autoTick = autoTick
    this.scene.tick(this.tick)
    this.scene.once('getGl', this.getGl)
  }

  private getGl = (gl:GLContext) => {
    this.gl = gl
  }

  public clear() {
    clear(this.gl, { color: [0, 0, 0, 1], depth: true })
  }

  public tick = () => {
    if (!this.needRefresh) return
    if (!this.gl) return
    if (this.stats) this.stats.update()
    // this.clear()
    if (!this.autoTick) this.needRefresh = false
    const viewer = this.scene.viewer
    
    resizeGLContext(this.gl)
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight)

    // 这里的child可以是group、shape和particle
    // shape和particle属于带有model的绘制，而group属于
    const projectionMatrix = viewer.computeProjectionMatrix(this.gl.drawingBufferWidth, this.gl.drawingBufferHeight)
    this.scene.children.forEach((child) => {
      if (isRenderable(child)) {
        child.render({
          uniforms: {
            u_projectionMatrix: projectionMatrix,
            u_viewMatrix: viewer.viewMatrix
          }
        })
      }
    })
    // console.log(projectionMatrix)
  }

  public destroy() {
    if (this.stats) {
      document.body.removeChild(this.stats.dom)
      this.stats = null as unknown as Stats
    }
  }
}
