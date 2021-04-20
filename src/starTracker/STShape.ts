import { Shape } from '../index'
import { Point } from '@/common'

interface STShapeConfig {
  name?: string
  start: Point
  end: Point
  width: number
}

// StarTrack Shape
export class STShape extends Shape {
  constructor({ name, start, end, width }:STShapeConfig) {
    super({
      name,
      geometry: {
        type: 'line',
        start,
        end,
        width
      },
      material: {
        type: 'standard',
        texture: 'brush_1',
        vs: `#version 300 es
          layout (location = 0) in vec4 positions;
          layout (location = 1) in vec2 uv;
          
          uniform mat4 u_projectionMatrix;
          uniform mat4 u_viewMatrix;
          uniform mat4 u_modelMatrix;
          uniform float u_textureHeight;

          out vec2 v_uv;

          void main() {
            vec4 pos = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(positions.xyz, f1);
            pos.y = -pos.y;
            gl_Position = pos;
            v_uv = uv; // vec2(gl_Position.x, uv.y);
          }
        `,
        fs: `#version 300 es
          
          uniform vec4 u_color;
          uniform sampler2D u_texture;
          uniform float u_brushWidthRate;
  
          in vec2 v_uv;
  
          out vec4 fragColor;
  
          void main() {
            #if (RENDER_CHANNEL == 100) // 仅仅开启alpha通道
              float accuracy = 0.0001;
              if (v_uv.y < fhalf - u_brushWidthRate - accuracy ||v_uv.y > fhalf + u_brushWidthRate + accuracy) fragColor = vec4(f0);
              else fragColor = vec4(f1); // texture2D(u_texture, vec2(v_uv.x, (v_uv.y - fhalf + u_brushWidthRate) / max(u_brushWidthRate, f1) * f2));
            #endif
          }
        `,
        uniforms: {
          u_textureHeight: 10,
          u_brushWidthRate: 2 / 40
        },
        defines: {
          // 星轨的渲染通道控制，alpha通道/height通道/颜色通道
          RENDER_CHANNEL: 100
        }
      }
    })
  }
}
