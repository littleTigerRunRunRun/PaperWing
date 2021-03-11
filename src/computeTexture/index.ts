import { childlike, Treelike, isRenderable } from '../utils'
import { Scene } from '@/core/Scene'
import { Viewer } from '../viewer'
import { GLContext } from '@/common'


export interface ComputeTextureConfig {
  width:number
  height:number
  scene:Scene,
  viewer:Viewer
}

// compute texture 重点在于compute，它是一个动态的计算过程，不放在管线里面的原因是，它的计算频率远低于per frame
export class ComputeTexture extends Treelike {
  private scene:Scene
  private gl:GLContext
  public viewer:Viewer
  public width:number
  public height:number
  constructor({ scene, viewer, width = 100, height = 100 }:ComputeTextureConfig) {
    super()

    this.scene = scene
    this.viewer = viewer
    this.width = width
    this.height = height

    this.scene.once('getGl', this.getGl)
  }

  private getGl = (gl:GLContext) => {
    this.gl = gl
  }

  public render() {
    // 这里的child可以是group、shape和particle
    const projectionMatrix = this.viewer.computeProjectionMatrix(this.width, this.height)
    this.children.forEach((child) => {
      if (isRenderable(child)) {
        child.render({
          uniforms: {
            u_projectionMatrix: projectionMatrix,
            u_viewMatrix: this.viewer.viewMatrix
          }
        })
      }
    })
  }
}
