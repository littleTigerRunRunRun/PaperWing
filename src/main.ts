import testStarTrack from './test/starTrack'

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
  testStarTrack(canvas)
}
