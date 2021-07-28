declare interface Dictionary<T> {
  [key:string]:T
}

declare interface ImageSource {
  key: string,
  promise: Promise<HTMLImageElement>
}

declare type GLContext = WebGLRenderingContext | WebGL2RenderingContext

declare interface Point {
  x:number
  y:number
  z?:number
}

declare interface PWPoint {
  x:number
  y:number
  z:number // z是指深度，一般是影响绘制顺序，更加复杂的情形下会和3d状态下的深度含义相同
  w:number // w不等于顶点着色器输出的GL_position中的w值，而是表示的点在连线中所在位置（起始点到这个点的距离（非直线距离）/路径总长度）
}

// 用于描述4 * 4的矩阵
declare type Length16NumberArray = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
]

declare type XYNumber = [number, number] // [x, y]

declare type FlexNumber = [number, number] // [baseNumber, flexRate]

declare type PercentStaticNumber = [number, number] // [percentNumber, staticNumber]

declare type RGBAColorObject = [number, number, number, number]

declare type Direction = 'v' | 'h'

declare type Vertical = 'top' | 'bottom' | 'middle'

declare type Orientation = 'top' | 'right' | 'bottom' | 'left'

// declare const OrientationVector = {
//   top: [0, 1],
//   right: [1, 0],
//   bottom: [0, -1],
//   left: [-1, 0]
// }

declare interface MaterialReceipt {
  vs:string
  fs:string
  uniforms:Dictionary<any>
  defines?:Dictionary<any>
}

declare interface Extend {
  left?:number
  right?:number
  top?:number
  bottom?:number
}
