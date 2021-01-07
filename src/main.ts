import { 
  Scene,
  Container2DGroup,
  Shape,
  OrthoViewer
} from './index'
import * as dat from 'dat.gui'

interface EntryConfig {
  canvas: HTMLCanvasElement
}

// 以下用于测试
declare global {
  interface Window {
    setPaperWingEntry(EntryConfig)
  }
}

const defaultData = {
  width: 400,
  height: 240
}
const handlers:any = {}
const controlls:any = {}

window.setPaperWingEntry = function(config: EntryConfig) {
  const { canvas } = config
  main(canvas)
}

function createGUI() {
  const gui = new dat.GUI()

  const containerSize = gui.addFolder('container size')
  containerSize.open()

  controlls.width = containerSize.add(defaultData, 'width')
  controlls.width.onChange((width) => {
    handlers.group.width = width
  })

  controlls.height = containerSize.add(defaultData, 'height')
  controlls.height.onChange((height) => {
    handlers.group.height = height
  })
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

  const g1 = new Container2DGroup({
    name: 'g1',
    width: defaultData.width,
    height: defaultData.height,
    helper: {
      stroke: { r: 1, g: 1, b: 1, a: 0.2 },
      strokeWidth: 4
    }
  })
  handlers.group = g1

  const rect1:Shape = new Shape({
    name: 'test',
    geometry: { type: 'rect', width: 120, height: 120, stroke: 40, x: 0, y: 0, rotate: 0 },
    fill: { type: 'pure', r: 1, g: 0.5, b: 0.2, a: 1 }
  })
  g1.add(rect1)
  scene.add(g1)

  // rect1.

  scene.tick(({ time }) => {
    // rect1.x = Math.sin(time * 0.002 + Math.PI * 0.5) * 200
    // rect1.y = Math.sin(time * 0.002 + Math.PI * 0.5) * 200
    // rect1.rotate = time * 0.002

    rect1.fill.g = 0.5 + Math.sin(time * 0.002 - Math.PI * 0.5) * 0.5
  })

  createGUI()
}
