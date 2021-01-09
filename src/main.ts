import { 
  Scene,
  Container2DGroup,
  Shape,
  OrthoViewer
} from './index'
import * as dat from 'dat.gui'
import { StarTrack, StarTrackConfig } from './starTracker'

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
  // controlls.width.onChange((width) => {
  //   handlers.group.width = width
  // })

  controlls.height = containerSize.add(defaultData, 'height')
  // controlls.height.onChange((height) => {
  //   handlers.group.height = height
  // })
}

// 测试程序，测试Tree/Leaf结构API的正确性
function main(canvas: HTMLCanvasElement) {
  // style modify
  document.body.style.backgroundColor = '#000'

  // main code
  const scene:Scene = new Scene({ canvas, stats: true, glParams: { depth: false } }) // 二维内容关闭深度测试
  const viewer:OrthoViewer = new OrthoViewer({ far: 4000 })
  scene.viewer= viewer
  const viewMatrix = viewer.viewMatrix
  
  const st = new StarTrack(rectStarTrack)
  scene.add(st.container)

  scene.tick(({ time }) => {
    // rect1.x = Math.sin(time * 0.002 + Math.PI * 0.5) * 200
    // rect1.y = Math.sin(time * 0.002 + Math.PI * 0.5) * 200
    // rect1.rotate = time * 0.002

    // rect1.fill.g = 0.5 + Math.sin(time * 0.002 - Math.PI * 0.5) * 0.5
  })

  createGUI()
}

const rectStarTrack:StarTrackConfig = {
  name: '', // 这个不必要
  title: '四方型边框',
  width: 400,
  height: 240,
  items: [
    {
      id: 1,
      // 描述了这段路径的视觉容器（内部的话还需要路径位置展示）
      type: 'rect',
      // 描述了颜色
      fill: { r: 1, g: 1, b: 1, a: 0.4 },
       // 默认的grow和shrink就是0
      h: { grow: 0, shrink: 0, basic: 40 },
      v: { basic: 40 }
    },
    {
      id: 2,
      type: 'rect',
      fill: { r: 1, g: 0.5, b: 0.4, a: 0.4 },
      h: { grow: 1, shrink: 1, basic: 20 },
      v: { grow: 1, shrink: 1, basic: 20 }
    },
    {
      id: 3,
      type: 'rect',
      fill: { r: 1, g: 1, b: 1, a: 0.4 },
      // 默认的grow和shrink就是0
      h: { grow: 0, shrink: 0, basic: 40 },
      v: { basic: 40 }
    }
  ]
  // squeeze: [
  //   {
  //     items: [1, 2, 3],
  //     direction: 'h'
  //   }
  // ]
}
