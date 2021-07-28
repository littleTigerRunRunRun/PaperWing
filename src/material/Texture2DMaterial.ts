import { Texture2D } from '@luma.gl/webgl'

export interface Texture2DMaterialConfig {
  type:string
}

export class Texture2DMaterial {
  public texture:Texture2D

  constructor({ }: Texture2DMaterialConfig) {
  }
  
  public getReceipt(is2:boolean):MaterialReceipt {
    return {
      vs: is2 ? `#version 300 es
        layout (location = 0) in vec4 positions;

        uniform mat4 u_projectionMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_modelMatrix;

        out vec2 v_uv;

        void main() {
          gl_Position = vec4((u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(positions.xyz, f1)).xyz, f1);
          v_uv = gl_Position.xy * fhalf + fhalf;
        }
      ` : `
        attribute vec4 positions;

        uniform mat4 u_projectionMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_modelMatrix;

        varying vec2 v_uv;

        void main() {
          gl_Position = vec4((u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(positions.xyz, f1)).xyz, f1);
          v_uv = gl_Position.xy * fhalf + fhalf;
        }
      `,
      fs: is2 ? `#version 300 es
        
        uniform vec4 u_color;

        in vec2 v_uv;

        out vec4 fragColor;

        void main() {
          fragColor = u_color;
        }
      ` : `
        varying vec2 v_uv;
        
        uniform vec4 u_color;

        void main() {
          gl_FragColor = u_color;
        }
      `,
      uniforms: this.getUniforms()
    }
  }

  public getUniforms() {
    return {
    }
  }

  public destroy() {
    
  }
}
