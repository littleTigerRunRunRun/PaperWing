import { Dictionary } from '@/common'
import { ComputeTexture, ComputeTextureConfig } from '@/computeTexture'
import { GetSetSize, GetSetNumber } from '@/utils/decorator/Number'
import { Framebuffer, Texture2D } from '@luma.gl/webgl'
import Subscriber from '@/core/Subscriber'
import { childlike } from '../utils'

// 将0 - 1的alpha映射到0 - 1的另一个范围
const DEFAULT_ALPHA_MAP = function(alpha) {
  return alpha
}

type AtomRepeatWay = 'NONE' | 'REPEAT' | 'CLAMP'

export interface AtomConfig {
  x:number,
  y:number,
  width:number,
  height:number,
  texture:string,
  alphaMap:Function, // 参与笔刷构建时的alpha值映射方式
  alphaParams:Dictionary<any> // 可能用于参与alphaMap的参数，
  flip:boolean, // 使用时的翻转
  repeat:AtomRepeatWay // 使用时的重复
}

export class Atom {
  public x:number = 0
  public y:number = 0
  public width:number = 0
  public height:number = 0
  public alphaParams:Dictionary<any> = {} // alphaMap可以通过修改参数来动态修改结果
  private alphaMap:Function = DEFAULT_ALPHA_MAP
  private texture:number = 0
  constructor({ x, y, width, height, texture, alphaMap, alphaParams, flip, repeat }:AtomConfig) {

  }
}

export interface Brush extends GetSetSize {}

// 笔刷是一种绘制对象，输入宽高之后，按照既定的绘制逻辑，更新一个材质。
@GetSetNumber('width', 0)
@GetSetNumber('height', 0)
export class Brush extends ComputeTexture {
  get texture():Texture2D { return this.buffer.texture }

  constructor(config:ComputeTextureConfig) {
    super(config)
  }
  
  public onWidthChange(width:number) {}
}
