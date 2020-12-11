// import testTreeAndLeaf from '../unit/utils/abstract/TreeAndLeaf' // Tree/Leaf系统测试用例
// import testRendererAndGeometry from '../test/geometry/RectGeometry'
// import testEvent from '../test/core/Event'
// import testLoop from '../test/core/RenderLoop'
import testTreeAndLeaf from './test/test'

declare interface EntryConfig {
  canvas: HTMLCanvasElement
}

// 以下用于测试
declare global {
  interface Window {
    setPaperWingEntry(EntryConfig)
  }
}

window.setPaperWingEntry = function(config: EntryConfig) {
  const { canvas } = config
  testTreeAndLeaf(canvas)
}
