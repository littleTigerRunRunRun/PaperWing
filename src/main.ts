import { 
  Scene,
  Container2DGroup,
  Shape,
  OrthoViewer,
  Texture2D,
  ComputeTexture
} from './index'
import * as dat from 'dat.gui'
import { StarTrack, StarTrackConfig, Brush, Atom, STShape } from './starTracker'

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
  width: 600,
  height: 360
}
const handlers:any = {}
const controlls:any = {}

window.setPaperWingEntry = function(config: EntryConfig) {
  const { canvas } = config
  main(canvas)
}

// 测试程序，测试Tree/Leaf结构API的正确性
function main(canvas: HTMLCanvasElement) {
  // style modify
  document.body.style.backgroundColor = '#000'

  // main code
  const scene:Scene = new Scene({
    canvas,
    stats: true,
    glParams: { depth: false },
    assets: {
      corner: {
        example1: '/assets/corner/example1.png'
      },
      atom: {
        solid: '/assets/atom/solid.png',
        linearGradient: '/assets/atom/linearGradient.png'
      }
    }
  }) // 二维内容关闭深度测试
  const viewer:OrthoViewer = new OrthoViewer({ far: 4000 })
  scene.viewer= viewer

  scene.onReady(() => {
    // 星轨容器
    const white = { r: 1, g: 1, b: 1, a: 0.1 }
    const red = { r: 1, g: 0.5, b: 0.4, a: 0.1 }

    const rectStarTrack:StarTrackConfig = {
      name: '', // 这个不必要
      title: '四方型边框',
      width: 600,
      height: 360,
      items: [
        {
          identity: 1,
          desc: '左上角的转角块',
          // 描述了颜色
          fill: white,
          // 默认的grow和shrink就是0
          h: { grow: 0, shrink: 0, basic: 40 },
          v: { basic: 40 }
        },
        { identity: 2, type: 'flex', desc: '上侧中间的可伸缩部分', fill: red, h: { basic: 40, grow: 1, shrink: 1 }, v: { basic: 40, grow: 1, shrink: 1 } },
        { identity: 3, desc: '右上角的转角块', fill: white, h: { basic: 40 }, v: { basic: 40 } },
        { identity: 4, desc: '左下角的转角块', fill: white, h: { basic: 40 }, v: { basic: 40} },
        { identity: 5, type: 'flex', desc: '下侧中间的可伸缩部分', fill: red, h: { basic: 40, grow: 1, shrink: 1 }, v: { basic: 40, grow: 1, shrink: 1 } },
        { identity: 6, desc: '右下角的转角块', fill: white, h: { basic: 40 }, v: { basic: 40} },
        { identity: 9, type: 'flex', desc: '左侧的可伸缩部分', fill: red, h: { basic: 40, grow: 1, shrink: 1 }, v: { basic: 40, grow: 1, shrink: 1 } },
        { identity: 10, type: 'flex', desc: '右侧的可伸缩部分', fill: red, h: { basic: 40, grow: 1, shrink: 1 }, v: { basic: 40, grow: 1, shrink: 1 } }
      ],
      // squeeze的放置顺序代表了执行顺序
      // 多个flex对物体的叠加效果还需要调整，目前不太符合预期
      flexs: [
        {
          identity: 7,
          direction: 'h',
          items: [1, 2, 3],
          h: { grow: 1, basic:80 },
          v: { basic: 40 }
          // space: { type: 'around', basic: 12, grow: 0, shrink: 0 }
        },
        { 
          identity: 8,
          direction: 'h',
          items: [4, 5, 6],
          h: { grow: 1, basic:80 },
          v: { basic: 40 }
          // space: { type: 'between', basic: 12, grow: 0, shrink: 0 }
        },
        {
          identity: 11,
          direction: 'v',
          items: [1, 9, 4],
          h: { grow: 0, basic: 40 },
          v: { basic: 0, grow: 1 }
          // space: { type: 'between', basic: 12, grow: 0, shrink: 0 }
        },
        {
          identity: 12,
          direction: 'v',
          items: [3, 10, 6],
          h: { grow: 0, basic: 40 },
          v: { basic: 0, grow: 1 }
          // space: { type: 'between', basic: 12, grow: 0, shrink: 0 }
        },
        {
          direction: 'v',
          items: [7, 8],
          space: { type: 'between', basic: 0, grow: 1, shrink: 1 }
        },
        {
          direction: 'h',
          items: [11, 12],
          space: { type: 'between', basic: 0, grow: 1, shrink: 1 }
        }
      ]
    }
    const st = new StarTrack(rectStarTrack)
    scene.add(st.container)

    const borderTop = st.getChildByIdentity(2)
    
    const brush = new Brush({
      name: 'brush_1', width: 10, height: 10, subscriber: scene.getSubscriber()
    })

    const atom1 = new Atom({
      name: 'a_1_1',
      type: 'solid',
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      grey: 1
    })
    brush.add(atom1)
    brush.render()

    // 绘制画笔时，默认要以2X比例绘制
    // const line1 = new STShape({
    //   name: 'line1',
    //   start: { x: 0, y: 0 },
    //   end: { x: 200, y: 0 },
    //   width: 80
    // })
    // borderTop.add(line1)
  })
}
