// import testTreeAndLeaf from '../unit/utils/abstract/TreeAndLeaf' // Tree/Leaf系统测试用例
// import testEvent from '../unit/core/Event'
// import testLoop from '../unit/core/RenderLoop'
import testRendererAndGeometry from '../unit/geometry/RectGeometry'

interface EntryConfig {
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
  testRendererAndGeometry(canvas)
}
