import { 
  Scene,
  Container2DGroup,
  Shape,
  OrthoViewer,
  Texture2D,
  ComputeTexture
} from './index'
import * as dat from 'dat.gui'
import { StarTrack, StarTrackConfig, Brush, Atom, StarTrackSegmentGroup } from './starTracker'
import { RGBAColorObject } from './common'

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
      },
      brush: {
        biline: '/assets/brush/biline.png'
      }
    },
    autoTick: false
  }) // 二维内容关闭深度测试
  ;(window as any).scene = scene
  const viewer:OrthoViewer = new OrthoViewer({ far: 4000 })
  scene.viewer= viewer

  scene.onReady(() => {
    // 星轨容器
    const white:RGBAColorObject = [1, 1, 1, 0.1]
    const red:RGBAColorObject = [1, 0.5, 0.4, 0.1]

    const rectStarTrack:StarTrackConfig = {
      name: '', // 这个不必要
      title: '四方型边框',
      width: 600,
      height: 360,
      samplerRate: 2,
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
        { identity: 2, type: 'flex', direction: 'right', desc: '上侧中间的可伸缩部分', fill: red, h: { basic: 40, grow: 1, shrink: 1 }, v: { basic: 40, grow: 1, shrink: 1 } },
        { identity: 3, desc: '右上角的转角块', fill: white, h: { basic: 40 }, v: { basic: 40 } },
        { identity: 4, desc: '左下角的转角块', fill: white, h: { basic: 40 }, v: { basic: 40} },
        { identity: 5, type: 'flex', direction: 'left', desc: '下侧中间的可伸缩部分', fill: red, h: { basic: 40, grow: 1, shrink: 1 }, v: { basic: 40, grow: 1, shrink: 1 } },
        { identity: 6, desc: '右下角的转角块', fill: white, h: { basic: 40 }, v: { basic: 40} },
        { identity: 9, type: 'flex', direction: 'top', desc: '左侧的可伸缩部分', fill: red, h: { basic: 40, grow: 1, shrink: 1 }, v: { basic: 40, grow: 1, shrink: 1 } },
        { identity: 10, type: 'flex', direction: 'bottom', desc: '右侧的可伸缩部分', fill: red, h: { basic: 40, grow: 1, shrink: 1 }, v: { basic: 40, grow: 1, shrink: 1 } }
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
    
    // 绘制画笔时，默认要以2X比例绘制
    // const brush = new Brush({
    //   name: 'brush_1', width: 24, height: 24, subscriber: scene.getSubscriber()
    // })

    // const atom1 = new Atom({ name: 'a_1_1', type: 'solid', width: 24, height: 4, x: 0, y: -6, grey: 1 })
    // brush.add(atom1)
    // const atom2 = new Atom({ name: 'a_1_2', type: 'solid', width: 24, height: 4, x: 0, y: 6, grey: 1 })
    // brush.add(atom2)
    // requestAnimationFrame(() => {
    //   brush.renderAndDownload()
    // })
    // console.log(brush)

    // const rect1 = new Shape({
    //   name: 'rect1',
    //   geometry: { type: 'rect', width: 20, height: 16 },
    //   material: {
    //     type: 'standard',
    //     color: [0.8, 0.6, 0.4, 1.0],
    //     texture: 'brush_1',
    //     vs: `#version 300 es
    //       layout (location = 0) in vec4 positions;
    //       layout (location = 1) in vec2 uv;

    //       uniform mat4 u_projectionMatrix;
    //       uniform mat4 u_viewMatrix;
    //       uniform mat4 u_modelMatrix;
    //       uniform float u_textureHeight;

    //       out vec2 v_uv;

    //       void main() {
    //         gl_Position = vec4((u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(positions.xyz, f1)).xyz, f1);
    //         gl_Position.y = -gl_Position.y;
    //         v_uv = uv; // vec2(gl_Position.x, uv.y);
    //       }
    //     `,
    //     fs: `#version 300 es
          
    //       uniform vec4 u_color;
    //       uniform sampler2D u_texture;
  
    //       in vec2 v_uv;
  
    //       out vec4 fragColor;
  
    //       void main() {
    //         #if (RENDER_CHANNEL == 100) // 仅仅开启alpha通道
    //           fragColor = texture2D(u_texture, v_uv);
    //         #endif
    //       }
    //     `,
    //     uniforms: {
    //       u_textureHeight: 10
    //     },
    //     defines: {
    //       // 星轨的渲染通道控制，alpha通道/height通道/颜色通道
    //       RENDER_CHANNEL: 100
    //     }
    //   }
    // })
    // scene.add(rect1)

    const borderTop = st.getChildByIdentity(2) as StarTrackSegmentGroup
    // borderTop.addSegment({ name: 't1', type: 'relative', flex: [20, 1], fill: [1, 0, 0, 0.8 ], thickness: 30, baseline: 'middle', verticalOffset: 0 })
    // borderTop.addSegment({ name: 't2', type: 'relative', flex: [60, 2], fill: [0, 1, 0, 0.8 ], thickness: 40, baseline: 'middle', verticalOffset: 0 })
    // borderTop.addSegment({ name: 't3', type: 'relative', flex: [20, 1], fill: [0, 0, 1, 0.8 ], thickness: 30, baseline: 'middle', verticalOffset: 0 })
    borderTop.addSegment({ name: 't1', type: 'absolute', psStart: [5, 0], psWidth: [90, 0], brush: 'brush_biline', brushWidth: 12, thickness: 40, baseline: 'middle', verticalOffset: 0, heightMap: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.008,0.016,0.024,0.032,0.04,0.048,0.056,0.064,0.072,0.08,0.088,0.096,0.104,0.112,0.12,0.128,0.136,0.144,0.152,0.16,0.168,0.176,0.184,0.192,0.2,0.208,0.216,0.224,0.232,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.232,0.224,0.216,0.208,0.2,0.192,0.184,0.176,0.168,0.16,0.152,0.144,0.136,0.128,0.12,0.112,0.104,0.096,0.088,0.08,0.072,0.064,0.056,0.048,0.04,0.032,0.024,0.016,0.008,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] })
    borderTop.sortRelatives()

    // scene.next()
    st.container.renderManually()
  })
}
