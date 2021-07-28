import { childlike, Treelike, isRenderable } from '../utils'
import { OrthoViewer } from '../viewer'
import { createColorBuffer } from './createBuffer'
import { Framebuffer } from '@luma.gl/webgl'
import { resizeGLContext } from '@luma.gl/gltools'

// compute texture 重点在于compute，它是一个动态的计算过程，不放在管线里面的原因是，它的计算频率远低于per frame
export class ComputeTexture extends Treelike {
  protected subscriber:PaperWingSubscriber
  protected gl!:GLContext
  protected samplerRate:number = 1
  public name:string
  public buffer!:Framebuffer
  public viewer:Viewer
  public width:number
  public height:number
  public get texture() { return this.buffer.color }
  constructor({ name, subscriber, viewer, width = 300, height = 200, samplerRate = 1 }:ComputeTextureConfig) {
    super()

    this.name = name
    this.subscriber = subscriber
    this.viewer = viewer || new OrthoViewer({ far: 2000, near: 0.01 })
    // console.log(this.viewer)
    this.width = width
    this.height = height
    this.samplerRate = samplerRate

    this.subscriber.once('getGl', this.getGl)
  }

  private getGl = (gl:GLContext) => {
    this.gl = gl
    this.buffer = createColorBuffer(gl, this.width, this.height)
    this.subscriber.set(`asset_${this.name}`, this.buffer.color)
  }

  public add(child:childlike):number {
    if (child.parent === this) return -1

    const index = super.add(child)
    child.setSubscriber(this.subscriber)

    return index
  }

  public render() {
    if (!this.gl) {
      console.error('no gl for compute texture to render')
      return
    }
    resizeGLContext(this.gl)
    this.gl.viewport(0, 0, this.width, this.height)

    // 这里的child可以是group、shape和particle
    const projectionMatrix = this.viewer.computeProjectionMatrix(this.width / this.samplerRate, this.height / this.samplerRate)
    this.children.forEach((child) => {
      if (isRenderable(child)) {
        child.render({
          framebuffer: this.buffer,
          uniforms: {
            u_samplerRate: this.samplerRate,
            u_projectionMatrix: projectionMatrix,
            u_viewMatrix: this.viewer.viewMatrix
          }
        })
      }
    })
  }

  public renderAndDownload() {
    if (!this.gl) {
      console.error('no gl for compute texture to render')
      return
    }
    resizeGLContext(this.gl)
    this.gl.viewport(0, 0, this.width, this.height)
    if (this.gl.canvas) {
      (this.gl.canvas as HTMLCanvasElement).style.width = `${this.width}px`;
      (this.gl.canvas as HTMLCanvasElement).style.height = `${this.height}px`
      this.gl.canvas.width = this.width
      this.gl.canvas.height = this.height
    }

    // 这里的child可以是group、shape和particle
    const projectionMatrix = this.viewer.computeProjectionMatrix(this.width / this.samplerRate, this.height / this.samplerRate)
    this.children.forEach((child) => {
      if (isRenderable(child)) {
        child.render({
          uniforms: {
            u_samplerRate: this.samplerRate,
            u_projectionMatrix: projectionMatrix,
            u_viewMatrix: this.viewer.viewMatrix
          }
        })
      }
    })
  }

  public renderTextureToMain() {
    
  }
}
