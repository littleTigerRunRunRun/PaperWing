import { 
  Scene,
  Shape,
  OrthoViewer
} from './index'

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
  main(canvas)
}

// 测试程序，测试Tree/Leaf结构API的正确性
function main(canvas: HTMLCanvasElement) {
  // style modify
  document.body.style.backgroundColor = '#000'

  // main code
  const scene:Scene = new Scene({ canvas, stats: true })
  const viewer:OrthoViewer = new OrthoViewer({ far: 4000 })
  scene.viewer= viewer
  const viewMatrix = viewer.viewMatrix

  const rect1:Shape = new Shape({
    name: 'test',
    geometry: { type: 'rect', width: 200, height: 100, stroke: 4, x: 0, y: 0, rotate: 0 },
    fill: { type: 'pure', r: 1, g: 0.5, b: 0.2, a: 1 },
    stroke: { type: 'pure', r: 1, g: 1, b: 1, a: 0.8 }
  })
  scene.add(rect1)

  scene.tick(({ time }) => {
    // rect1.x = Math.sin(time * 0.002 + Math.PI * 0.5) * 200
    // rect1.y = Math.sin(time * 0.002 + Math.PI * 0.5) * 200
    // rect1.rotate = time * 0.002

    rect1.fill.g = 0.5 + Math.sin(time * 0.002 - Math.PI * 0.5) * 0.5
  })
}
