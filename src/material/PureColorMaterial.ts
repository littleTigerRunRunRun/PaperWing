import { GLContext, MaterialReceipt, RGBAColorObject } from '@/common'

export interface PureColorMaterialConfig {
  type:string
  color:RGBAColorObject
}

export class PureColorMaterial {
  public get r():number { return this.color[0] }
  public set r(r:number) { this.color[0] = r }

  public get g():number { return this.color[1] }
  public set g(g:number) { this.color[1] = g }

  public get b():number { return this.color[2] }
  public set b(b:number) { this.color[2] = b }
  
  public get a():number { return this.color[3] }
  public set a(a:number) { this.color[3] = a }

  private color:RGBAColorObject
  constructor({ color }: PureColorMaterialConfig) {
    this.color = color
  }
  
  public getReceipt(is2:boolean, gl:GLContext):MaterialReceipt {
    return {
      vs: is2 ? `#version 300 es
        layout (location = 0) in vec4 positions;

        uniform mat4 u_projectionMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_modelMatrix;

        out vec2 v_uv;

        void main() {
          gl_Position = vec4((u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(positions.xyz, f1)).xyz, f1);
          gl_Position.y = -gl_Position.y;
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
          gl_Position.y = -gl_Position.y;
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
      u_color: this.color
    }
  }

  public destroy() {
    
  }
}