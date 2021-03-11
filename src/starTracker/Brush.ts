import { Container2DGroup, Shape } from '../index'

// 将0 - 1的alpha映射到0 - 1的另一个范围
const DEFAULT_ALPHA_MAP = function(alpha) {
  return alpha
}

type AtomRepeatWay = 'NONE' | 'REPEAT' | 'CLAMP'

interface Atom {
  x:number,
  y:number,
  width:number,
  height:number,
  texture:string,
  alphaMap:Function, // 参与笔刷构建时的alpha值映射方式
  flip:boolean, // 使用时的翻转
  repeat:AtomRepeatWay // 使用时的重复
}

export interface BrushConfig {
  width: number,
  height: number
}

// 笔刷是一种绘制对象，输入宽高之后，按照既定的绘制逻辑，更新一个材质。
export class Brush {
  constructor() {

  }
}