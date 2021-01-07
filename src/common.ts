export interface Dictionary<T> {
  [key:string]:T
}

export interface ImageSource {
  key: string,
  promise: Promise<HTMLImageElement>
}

export type GLContext = WebGLRenderingContext | WebGL2RenderingContext

export interface Point {
  x:number
  y:number
  z?:number
}

export interface PWPoint {
  x:number
  y:number
  z:number // z是指深度，一般是影响绘制顺序，更加复杂的情形下会和3d状态下的深度含义相同
  w:number // w不等于顶点着色器输出的GL_position中的w值，而是表示的点在连线中所在位置（起始点到这个点的距离（非直线距离）/路径总长度）
}

export type Length16Array = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
]

export type RGBAColorObject = {
  r: number,
  g: number,
  b: number,
  a: number
}