// viewer是一个特殊的模块类型，在3d中，更加接近这个概念的是camera，在2d中又没有这样一个概念，但是需要做尺寸适配。
// 而本库属于一种三维画二维/三维的方法，因此会兼而需要两种特性，既能够处理正交、透视类型的相机，也能够处理纯二维情况下的尺寸适配的问题
// 而因为其本身都是一个矩阵变换的问题，所以是可以统一起来的


// auto是指100%扩展到角落
// cover保持原本比例不变，尽可能最大展示
// contain保持原本比例不变，内容尽可能最小的情况下包含容器
// none不作任何处理，直接往width * height的画布上放

export { BaseViewer } from './BaseViewer'

export { OrthoViewer } from './OrthoViewer'