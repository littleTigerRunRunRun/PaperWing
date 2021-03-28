import { 
  Scene,
  Shape,
  OrthoViewer,
  ComputeTexture
} from '../../src/index'

// 测试程序，测试computeTexture API的正确性
export default function main(canvas: HTMLCanvasElement) {
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
    // console.log(atom2)

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
            v_uv = uv; // vec2(gl_Position.x, uv.y);
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
}