import { BaseViewer, BaseViewerParams } from './BaseViewer'
import { Matrix4 } from 'math.gl'

interface OrthoViewerParams extends BaseViewerParams {
  far?:number
  near?:number
}

interface OrthoSetting {
  left:number
  right:number
  bottom:number
  top:number
}

// 它包含了BaseViewer的功能，同时它具备自己的正交相机域，因此可以做到二维和三维的切换
export class OrthoViewer extends BaseViewer {
  private far:number
  private near:number

  constructor(params:OrthoViewerParams = {}) {
    super(params)
    const { far = 1000, near = 0.1 } = params
    this.far = far
    this.near = near

    this.viewMatrix = this.viewMatrix.lookAt({ eye: [0, 0, far * 0.5], center: [0, 0, 0], up: [0, 1, 0] })
  }

  public computeProjectionMatrix(width:number, height:number):Matrix4 {
    if (this.glWidth === width && this.glHeight === height) return this.projectionMatrix
    this.glWidth = width
    this.glHeight = height

    if (!this.projectionMatrix) this.projectionMatrix = new Matrix4()
    this.projectionMatrix.ortho({
      left: this.glWidth * -0.5, 
      right: this.glWidth * 0.5,
      bottom: this.glHeight * -0.5,
      top: this.glHeight * 0.5,
      near: this.near,
      far: this.far
    })

    return this.projectionMatrix
  }

  update() {}
}