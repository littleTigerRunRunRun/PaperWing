import { 
  Scene,
  Container2DGroup,
  Shape,
  OrthoViewer,
  Texture2D,
  ComputeTexture
} from './index'
import * as dat from 'dat.gui'
import { StarTrack, StarTrackConfig, Brush, Atom } from './starTracker'

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

function createGUI() {
  const gui = new dat.GUI()

  const containerSize = gui.addFolder('container size')
  containerSize.open()

  // controlls.width = containerSize.add(defaultData, 'width')
  // controlls.width.onChange((width) => {
  //   handlers.group.width = width
  // })

  // controlls.height = containerSize.add(defaultData, 'height')
  // controlls.height.onChange((height) => {
  //   handlers.group.height = height
  // })
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
    console.log('excute onReady')
    const computeTexture = new ComputeTexture({ name: 'test_tile', width: 8, height: 10, subscriber: scene.getSubscriber() })
    const atom1 = new Shape({
      name: 'a1',
      geometry: { type: 'rect', width: 8, height: 2 },
      material: {
        type: 'standard',
        texture: 'atom_solid'
      }
    })
    computeTexture.add(atom1)
    atom1.y = 4

    const atom2 = new Shape({
      name: 'a2',
      geometry: { type: 'rect', width: 8, height: 2 },
      material: {
        type: 'standard',
        texture: 'atom_solid'
      }
    })
    computeTexture.add(atom2)
    atom2.y = -4
    console.log(atom2)

    computeTexture.render()

    const rect1 = new Shape({
      name: 'rect1',
      geometry: { type: 'rect', width: 200, height: 20 },
      material: {
        type: 'standard',
        color: { r: 0.8, g: 0.6, b: 0.4, a: 1.0},
        texture: 'test_tile',
        vs: `#version 300 es
          layout (location = 0) in vec4 positions;
          layout (location = 1) in vec2 uv;

          uniform mat4 u_projectionMatrix;
          uniform mat4 u_viewMatrix;
          uniform mat4 u_modelMatrix;
          uniform float u_textureHeight;

          out vec2 v_uv;

          void main() {
            gl_Position = vec4((u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(positions.xyz, f1)).xyz, f1);
            v_uv = vec2(gl_Position, uv.y);
          }
        `,
        fs: `#version 300 es
          
          uniform vec4 u_color;
          uniform sampler2D u_texture;
  
          in vec2 v_uv;
  
          out vec4 fragColor;
  
          void main() {
            #if (RENDER_CHANNEL == 100) // 仅仅开启alpha通道
              fragColor = mix(texture2D(u_texture, v_uv), vec4(0.3, 0.3, 0.3, 1.0), 0.5);
            #endif
          }
        `,
        uniforms: {
          u_textureHeight: 10
        },
        defines: {
          // 星轨的渲染通道控制，alpha通道/height通道/颜色通道
          RENDER_CHANNEL: 100
        }
      }
    })
    scene.add(rect1)
  })

  // const rect2 = new Shape({
  //   name: 'rect2',
  //   geometry: { type: 'rect', width: 100, height: 100 },
  //   material: {
  //     type: 'standard',
  //     color: { r: 0.8, g: 0.6, b: 0.4, a: 1.0},
  //     texture: 'atom_solid',
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
  //     defines: {
  //       // 星轨的渲染通道控制，alpha通道/height通道/颜色通道
  //       RENDER_CHANNEL: 100
  //     }
  //   }
  // })
  // rect2.x = 150
  // scene.add(rect2)

  scene.tick(({ time }) => {
    // st.container.width = 600 + Math.sin(time * 0.002 + Math.PI * 0.5) * 100
    // st.container.height = 360 + Math.cos(time * 0.002 + Math.PI * 0.5) * 40
    
    // rect1.x = Math.sin(time * 0.002 + Math.PI * 0.5) * 200
    // rect1.y = Math.sin(time * 0.002 + Math.PI * 0.5) * 200
    // rect1.rotate = time * 0.002

    // rect1.fill.g = 0.5 + Math.sin(time * 0.002 - Math.PI * 0.5) * 0.5
  })

  createGUI()
}

const white = { r: 1, g: 1, b: 1, a: 0.4 }
const red = { r: 1, g: 0.5, b: 0.4, a: 0.4 }
const rectStarTrack:StarTrackConfig = {
  name: '', // 这个不必要
  title: '四方型边框',
  width: 600,
  height: 360,
  items: [
    {
      identity: 1,
      desc: '左上角的转角块',
      // 描述了这段路径的视觉容器（内部的话还需要路径位置展示）
      type: 'rect',
      // 描述了颜色
      fill: white,
       // 默认的grow和shrink就是0
      h: { grow: 0, shrink: 0, basic: 40 },
      v: { basic: 40 }
    },
    { identity: 2, desc: '上侧中间的可伸缩部分', type: 'rect', fill: red, h: { basic: 20, grow: 1, shrink: 1 }, v: { basic: 20, grow: 1, shrink: 1 } },
    { identity: 3, desc: '右上角的转角块', type: 'rect', fill: white, h: { basic: 40 }, v: { basic: 40 } },
    { identity: 4, desc: '左下角的转角块', type: 'rect', fill: white, h: { basic: 40 }, v: { basic: 40} },
    { identity: 5, desc: '下侧中间的可伸缩部分', type: 'rect', fill: red, h: { basic: 20, grow: 1, shrink: 1 }, v: { basic: 20, grow: 1, shrink: 1 } },
    { identity: 6, desc: '右下角的转角块', type: 'rect', fill: white, h: { basic: 40 }, v: { basic: 40} },
    { identity: 9, desc: '左侧的可伸缩部分', type: 'rect', fill: red, h: { basic: 20, grow: 1, shrink: 1 }, v: { basic: 20, grow: 1, shrink: 1 } },
    { identity: 10, desc: '右侧的可伸缩部分', type: 'rect', fill: red, h: { basic: 20, grow: 1, shrink: 1 }, v: { basic: 20, grow: 1, shrink: 1 } }
  ],
  // squeeze的放置顺序代表了执行顺序
  flexs: [
    { direction: 'v', items: [7, 8], space: { type: 'between', basic: 0, grow: 1, shrink: 1 } },
    { direction: 'h', items: [11, 12], space: { type: 'between', basic: 0, grow: 1, shrink: 1 } },
    {
      identity: 7,
      direction: 'h',
      items: [1, 2, 3],
      h: { grow: 1, basic:80 },
      v: { basic: 40 },
      space: { type: 'between', basic: 12, grow: 0, shrink: 0 }
    },
    { 
      identity: 8,
      direction: 'h',
      items: [4, 5, 6],
      h: { grow: 1, basic:80 },
      v: { basic: 40 },
      space: { type: 'between', basic: 12, grow: 0, shrink: 0 }
    },
    {
      identity: 11,
      direction: 'v',
      items: [1, 9, 4],
      h: { grow: 0, basic: 40 },
      v: { basic: 0, grow: 1 },
      space: { type: 'between', basic: 12, grow: 0, shrink: 0 }
    },
    {
      identity: 12,
      direction: 'v',
      items: [3, 10, 6],
      h: { grow: 0, basic: 40 },
      v: { basic: 0, grow: 1 },
      space: { type: 'between', basic: 12, grow: 0, shrink: 0 }
    }
  ]
}
