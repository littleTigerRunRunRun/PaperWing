// viewer是一个特殊的模块类型，在3d中，更加接近这个概念的是camera，在2d中又没有这样一个概念，但是需要做尺寸适配。
// 而本库属于一种三维画二维/三维的方法，因此会兼而需要两种特性，既能够处理正交、透视类型的相机，也能够处理纯二维情况下的尺寸适配的问题
// 而因为其本身都是一个矩阵变换的问题，所以是可以统一起来的

import { Matrix4 } from 'math.gl'
import { Length16Array } from '@/common'

export interface Viewer {
  viewMatrix:Matrix4
  projectionMatrix:Matrix4
  // resolutionMatrix:Matrix4 
  computeResolutionMatrix(width:number, height:number):Matrix4
}

// auto是指100%扩展到角落
// cover保持原本比例不变，尽可能最大展示
// contain保持原本比例不变，内容尽可能最小的情况下包含容器
// none不作任何处理，直接往width * height的画布上放
type FitScheme = 'auto' | 'cover' | 'contain' | 'none'

interface BaseViewerParams {
  width?:number
  height?:number
  fit?:FitScheme
}

export class BaseViewer implements Viewer {
  public viewMatrix:Matrix4
  public projectionMatrix:Matrix4
  public resolutionMatrix:Matrix4 // 1.resolutionMatrix将标准的1 * 1的二维空间映射成 w * h
  private width:number
  private height:number
  private glWidth:number
  private glHeight:number

  constructor(params:BaseViewerParams = {}) {
    const { width = 100, height = 100, fit = 'auto' } = params
    this.width = width
    this.height = height
  }

  // 根据实时的width/height计算适配矩阵
  public computeResolutionMatrix(width:number, height:number):Matrix4 {
    if (this.glWidth === width && this.glHeight === height) return this.resolutionMatrix
    this.glWidth = width
    this.glHeight = height

    const matrix:Length16Array = [
      2/width, 0, 0, 0,
      0, -2/height, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]
    if (this.resolutionMatrix) {
      this.resolutionMatrix.set(...matrix)
    } else {
      this.resolutionMatrix = new Matrix4(matrix)
    } 

    return this.resolutionMatrix
  }
}