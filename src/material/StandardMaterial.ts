import Subscriber from '@/core/Subscriber'
import { Texture2D } from '@luma.gl/webgl'
import GL from '@luma.gl/constants'

export interface StandardMaterialConfig {
  type: string,
  color?: RGBAColorObject // 基色
  texture?: string // 贴图，相比起三维中用uv来上贴图，这里需要单个值（对于条状部件来说，对于块状依然要uv）
  normalMap?: any // 法向量贴图，这里暂时用any代替等定义完了之后再替换过来，这里的normalMap是用于做几何调整，而且因为降维了，所以它会变成一个更加简单的数据结构
  uniformTextures: Array<string> // 一些会注入着色器中作为样本使用的贴图
  fs?:string
  vs?:string
  defines?:Dictionary<any>
  uniforms?:Dictionary<any>
}
// 渐变：使用utils.createGradientTexture来生成一个渐变贴图使用
// 外发光/内发光（对应的外阴影和内阴影其实在2d范畴内是一个概念）方案可能是用后处理
// 应该会支持后处理

// 标准通用材质
export class StandardMaterial {
  public get r():number { return this.color[0] }
  public set r(r:number) { this.color[0] = r }

  public get g():number { return this.color[1] }
  public set g(g:number) { this.color[1] = g }

  public get b():number { return this.color[2] }
  public set b(b:number) { this.color[2] = b }
  
  public get a():number { return this.color[3] }
  public set a(a:number) { this.color[3] = a }
  
  private _color:RGBAColorObject
  get color() { return this._color }
  set color(color:RGBAColorObject) {
    this._color = color
    // do something to change uniforms
  }

  private _texture:string = ''
  public textureObject:Texture2D = null
  get texture() { return this._texture }
  set texture(texture:string) {
    this._texture = texture
    // do somthing to change uniforms
  }

  private _normalMap:any
  get normalMap() { return this._normalMap }
  set normalMap(normalMap:any) {
    this._normalMap = normalMap
    // do something to change uniforms
  }

  private _uniformTextures:Array<string> = []
  private _uniformTextureObjects:Array<Texture2D> = []
  get uniformTextures() { return this._uniformTextures }
  set uniformTextures(uniformTextures:Array<string>) {
    this._uniformTextures.splice(0, this._uniformTextures.length, ...uniformTextures)
    // do something to change uniforms
  }

  public fs:string
  public vs:string
  public gl:GLContext
  public uniforms:Dictionary<any>
  public defines:Dictionary<any>
  private subscriber:Subscriber

  constructor({ color = [0, 0, 0, 0], texture = null, normalMap = null, uniformTextures = [], fs = '', vs = '', uniforms = null, defines = null }:StandardMaterialConfig) {
    this.color = color
    this.texture = texture
    this.normalMap = normalMap
    this.uniformTextures = uniformTextures
    this.fs = fs
    this.vs = vs
    this.uniforms = uniforms
    this.defines = defines
  }

  // :MaterialReceipt 返回回执
  public getReceipt(is2:boolean, gl:GLContext, subscriber:Subscriber):MaterialReceipt {
    this.subscriber = subscriber
    this.gl = gl
    this.createTexture()

    return {
      vs: this.vs ? this.vs : (is2 ? `#version 300 es
        layout (location = 0) in vec4 positions;
        layout (location = 1) in vec2 uv;

        uniform mat4 u_projectionMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_modelMatrix;

        out vec2 v_uv;

        void main() {
          gl_Position = vec4((u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(positions.xyz, f1)).xyz, f1);
          gl_Position.y = -gl_Position.y;
          v_uv = uv;
        }
      ` : `
        attribute vec4 positions;
        attribute vec2 uv;

        uniform mat4 u_projectionMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_modelMatrix;

        varying vec2 v_uv;

        void main() {
          gl_Position = vec4((u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(positions.xyz, f1)).xyz, f1);
          gl_Position.y = -gl_Position.y;
          v_uv = uv;
        }
      `),
      fs: this.fs ? this.fs : (is2 ? `#version 300 es
        
        uniform vec4 u_color;
        uniform sampler2D u_texture;

        in vec2 v_uv;

        out vec4 fragColor;

        void main() {
          #if (RENDER_BASE == 1) // 使用贴图为基底
            fragColor = texture2D(u_texture, v_uv);
          #endif
          #if (RENDER_BASE == 0) // 使用颜色为基底
            fragColor = u_color;
          #endif
        }
      ` : `
        varying vec2 v_uv;
        
        uniform vec4 u_color;
        uniform sampler2D u_texture;

        void main() {
          gl_FragColor = u_color;
        }
      `),
      uniforms: this.getUniforms(),
      defines: Object.assign({
        RENDER_BASE: this.texture ? 1 : 0
      }, this.defines)
    }
  }

  private createTexture() {
    const asset = this.subscriber.get(`asset_${this.texture}`)
    if (this.textureObject || !asset) return
    if (asset && asset instanceof Texture2D) {
      this.textureObject = asset
      return
    }
    
    this.textureObject = new Texture2D(this.gl, { data: this.subscriber.get(`asset_${this.texture}`) });
    (this.textureObject as any).setParameters({
      [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
      [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
    })
  }

  public getUniforms() {
    this.createTexture()

    return Object.assign({
      u_color: this.color,
      u_texture: this.textureObject
    }, this.uniforms)
  }

  public destroy() {
    
  }
}
