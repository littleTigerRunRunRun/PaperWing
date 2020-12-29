import { BaseViewer, BaseViewerParams } from './index'

interface OrthoViewerParams extends BaseViewerParams {

}

// 它包含了BaseViewer的功能，同时它具备自己的正交相机域，因此可以做到二维和三维的切换
export class OrthoViewer extends BaseViewer {
  constructor(params:OrthoViewerParams = {}) {
    super(params)
  }
}