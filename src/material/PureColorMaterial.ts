import { Dictionary } from "@/common"

export interface PureColorMaterialConfig {
  type:string
  r:number
  g:number
  b:number
  a:number
}

interface MaterialReceipt {
  vs:string
  fs:string
  uniforms:Dictionary<any>
}

export class PureColorMaterial {
  public r:number = 0
  public g:number = 0
  public b:number = 0
  public a:number = 0

  constructor({ r, g, b, a }: PureColorMaterialConfig) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
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

  getUniforms() {
    return {
      u_color: [this.r, this.g, this.b, this.a]
    }
  }

  public destroy() {
    
  }
}