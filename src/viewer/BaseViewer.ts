import { Matrix4 } from 'math.gl'

export class BaseViewer implements Viewer {
  public viewMatrix:Matrix4 = new Matrix4()
  public projectionMatrix:Matrix4 = new Matrix4()
  protected width:number
  protected height:number
  protected glWidth:number = 0
  protected glHeight:number = 0

  constructor(params:BaseViewerParams = {}) {
    const { width = 100, height = 100 } = params
    this.width = width
    this.height = height
  }

  // 根据实时的width/height计算适配矩阵
  public computeProjectionMatrix(width:number, height:number):Matrix4 {
    if (this.glWidth === width && this.glHeight === height) return this.projectionMatrix
    this.glWidth = width
    this.glHeight = height

    const matrix:Length16NumberArray = [
      2/width, 0, 0, 0,
      0, 2/height, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]
    if (this.projectionMatrix) {
      this.projectionMatrix.set(...matrix)
    } else {
      this.projectionMatrix = new Matrix4(matrix)
    }

    return this.projectionMatrix
  }

  public destroy() {}
}