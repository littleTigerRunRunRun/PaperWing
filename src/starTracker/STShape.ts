import { Shape } from '../index'
import { Point, RGBAColorObject, Vertical, FlexNumber, PercentStaticNumber, XYNumber } from '@/common'

interface STShapeConfig {
  name?:string
  start:Point
  end:Point
  thickness:number
  order?:number
  flex?:FlexNumber
  psWidth?:PercentStaticNumber
  psStart?:PercentStaticNumber
  psEnd?:PercentStaticNumber
  fill?:RGBAColorObject
  brush?:string
  brushWidth?:number
  direction:XYNumber
  baseline?:Vertical
  verticalOffset?:number
  heightMap?:Array<number>
}

const alignStrategy = {
  middle(height:number, thickness:number, verticalOffset:number):number {
    return height * 0.5 + verticalOffset
  },
  top(height:number, thickness:number, verticalOffset:number):number {
    return thickness * 0.5 + verticalOffset
  },
  bottom(height:number, thickness:number, verticalOffset:number):number {
    return height - thickness * 0.5 + verticalOffset
  }
}

// StarTrack Shape
export class STShape extends Shape {
  private spaceJust:boolean = true
  public order:number = 0
  public flex:FlexNumber
  public psWidth:PercentStaticNumber
  public psStart:PercentStaticNumber
  public psEnd:PercentStaticNumber
  public direction:XYNumber
  public thickness:number
  public baseline:Vertical
  public verticalOffset:number

  constructor({ name, start, end, thickness, order = 0, flex, psWidth, psStart, psEnd, fill = [1, 1, 1, 1], brush, brushWidth = 4, direction = [1, 0], baseline = 'middle', verticalOffset = 0, heightMap = [0, 0] }:STShapeConfig) {
    super({
      name,
      geometry: {
        type: 'line',
        start,
        end,
        thickness
      },
      material: {
        type: 'standard',
        texture: brush,
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
            v_uv = uv;
          }
        `,
        fs: `#version 300 es
          
          uniform vec4 u_color;
          uniform sampler2D u_texture;
          uniform float u_brushWidthRate;
          uniform float[HEIGHT_MAP_LENGTH] u_heightMap;
  
          in vec2 v_uv;
  
          out vec4 fragColor;
  
          void main() {
            float heightPos = v_uv.x * float(HEIGHT_MAP_LENGTH);
            float leftValue = floor(heightPos);
            float rightValue = ceil(heightPos);
            float heightOffset = mix(u_heightMap[int(leftValue)], u_heightMap[int(rightValue)], heightPos - leftValue);

            #if (RENDER_CHANNEL == 100) // 仅仅开启alpha通道
              // float accuracy = 0.0001;
              // if (v_uv.y < fhalf - u_brushWidthRate - accuracy ||v_uv.y > fhalf + u_brushWidthRate + accuracy) fragColor = vec4(f0);
              // else fragColor = texture2D(u_texture, vec2(v_uv.x, (v_uv.y - fhalf + u_brushWidthRate) / max(u_brushWidthRate, f1) * f2));
              fragColor = texture2D(u_texture, vec2(f0, max(f0, (v_uv.y - fhalf - heightOffset + u_brushWidthRate) / u_brushWidthRate / f2)));
            #endif
            #if (RENDER_CHANNEL == 101) // 仅仅开启alpha通道
              fragColor = u_color;
            #endif
          }
        `,
        uniforms: {
          u_textureHeight: 10,
          u_brushWidthRate: brushWidth / thickness / 2,
          u_color: fill,
          u_heightMap: heightMap
        },
        defines: {
          // 星轨的渲染通道控制，alpha通道/height通道/颜色通道
          RENDER_CHANNEL: brush ? 100 : 101,
          HEIGHT_MAP_LENGTH: heightMap.length
        }
      }
    })

    this.order = order
    this.flex = flex
    this.psWidth = psWidth
    this.psStart = psStart
    this.psEnd = psEnd
    this.direction = direction
    this.thickness = thickness
    this.baseline = baseline
    this.verticalOffset = verticalOffset
  }

  private _offsetX:number = 0
  public get offsetX():number {
    return this._offsetX
  }
  public set offsetX(offsetX:number) {
    if (offsetX === this._offsetX) return
    this._offsetX = offsetX
    this.x = offsetX
  }

  // private _offsetY:number = 0
  // public get offsetY():number {
  //   return this._offsetY
  // }
  // public set offsetY(offsetY:number) {
  //   if (offsetY === this._offsetY) return
  //   this._offsetY = offsetY
  //   this.y = offsetY
  // }

  public setOffsetY(height:number) {
    this.y = alignStrategy[this.baseline](height, this.thickness, this.verticalOffset)
  }

  private _length:number = 0
  public get length():number {
    return this._length
  }
  public set length(length:number) {
    if (length === this._length) return
    this._length = length
    
    // 更新
    this.geometry._refreshGeometry({
      type: 'line',
      start: { x: 0, y: 0 },
      end: { x: this.direction[0] * this.length, y: this.direction[1] * this.length },
      thickness: this.thickness
    })
  }
}
