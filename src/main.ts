// import testTreeAndLeaf from '../test/utils/abstract/TreeAndLeaf' // Tree/Leaf系统测试用例
import testRendererAndGeometry from '../test/geometry/RectGeometry'

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
  testRendererAndGeometry(canvas)
}
