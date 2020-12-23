// viewer是一个特殊的模块类型，在3d中，更加接近这个概念的是camera，在2d中又没有这样一个概念，但是需要做尺寸适配。
// 而本库属于一种三维画二维/三维的方法，因此会兼而需要两种特性，既能够处理正交、透视类型的相机，也能够处理纯二维情况下的尺寸适配的问题
// 而因为其本身都是一个矩阵变换的问题，所以是可以统一起来的

import { Matrix4 } from 'math.gl'
import { GLContext } from '@/common'

interface Viewer {
  gl:GLContext
  viewMatrix:Matrix4
  projectionMatrix:Matrix4
}

export class BaseViewer implements Viewer {
  public viewMatrix:Matrix4
  public projectionMatrix:Matrix4
  public resolutionMatrix:Matrix4 // 1.resolutionMatrix将标准的1 * 1的二维空间映射成 w * h
  public gl:GLContext

  constructor({ resolution }) {

  }
}