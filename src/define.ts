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

declare type RGBAColorArray = [number, number, number, number]

declare type Direction = 'v' | 'h'

declare type Vertical = 'top' | 'bottom' | 'middle'

declare type Orientation = 'top' | 'right' | 'bottom' | 'left'

// declare const OrientationVector = {
//   top: [0, 1],
//   right: [1, 0],
//   bottom: [0, -1],
//   left: [-1, 0]
// }

declare interface Extend {
  left?:number
  right?:number
  top?:number
  bottom?:number
}

// viewer
declare type FitScheme = 'auto' | 'cover' | 'contain' | 'none'

declare interface OrthoViewerParams extends BaseViewerParams {
  far?:number
  near?:number
}

declare interface OrthoSetting {
  left:number
  right:number
  bottom:number
  top:number
}

declare interface Matrix4 {
  copy(array: Length16NumberArray):void
  // eslint-disable-next-line max-params
  set(
    m00: number,
    m01: number,
    m02: number,
    m03: number,
    m10: number,
    m11: number,
    m12: number,
    m13: number,
    m20: number,
    m21: number,
    m22: number,
    m23: number,
    m30: number,
    m31: number,
    m32: number,
    m33: number
  ):void
  setRowMajor(
    m00: number,
    m01: number,
    m02: number,
    m03: number,
    m10: number,
    m11: number,
    m12: number,
    m13: number,
    m20: number,
    m21: number,
    m22: number,
    m23: number,
    m30: number,
    m31: number,
    m32: number,
    m33: number
  ):void

  toRowMajor(result: Length16NumberArray):void

  identity(): Matrix4

  // Calculates a 4x4 matrix from the given quaternion
  fromQuaternion(q: number[]): Matrix4

  // Generates a frustum matrix with the given bounds
  frustum(args: {
    left: number
    right: number
    bottom: number
    top: number
    near: number
    far: number
  }): Matrix4

  // Generates a look-at matrix with the given eye position, focal point, and up axis
  lookAt(eye: number[], center?: number[], up?: number[]): Matrix4
  lookAt(args: {eye: number[], center?: number[], up?: number[]}): Matrix4

  // Generates a orthogonal projection matrix with the given bounds
  ortho(args: {
    left: number
    right: number
    bottom: number
    top: number
    near: number
    far: number
  }): Matrix4

  // Generates an orthogonal projection matrix with the same parameters
  orthographic(args: {
    fovy: number
    aspect?: number
    focalDistance?: number
    near?: number
    far?: number
  }): Matrix4

  // Generates a perspective projection matrix with the given bounds
  perspective(args: {
    fovy?: number
    fov?: number
    aspect?: number
    near?: number
    far?: number
  }): Matrix4

  // Accessors

  determinant(): Matrix4

  // Decomposition
  // Extracts the non-uniform scale assuming the matrix is an affine transformation.
  // The scales are the "lengths" of the column vectors in the upper-left 3x3 matrix.
  getScale(): number[]
  getScale<T extends number[]>(result: T): T
  // Gets the translation portion, assuming the matrix is a affine transformation matrix.
  getTranslation(): number[]
  getTranslation<T extends number[]>(result: T): T
  // Gets upper left 3x3 pure rotation matrix (non-scaling), assume affine transformation matrix
  getRotation(): number[]
  getRotation<T extends number[]>(result: T, scaleResult?: number[]): T
  getRotationMatrix3(): number[]
  getRotationMatrix3<T extends number[]>(result: T, scaleResult?: number[]): T

  // Modifiers
  transpose(): Matrix4
  invert(): Matrix4

  // Operations
  multiplyLeft(a: number[]): Matrix4
  multiplyRight(a: number[]): Matrix4

  scale(factor:any): Matrix4
  translate(vec:any): Matrix4
  rotateX(radians: number): Matrix4
  rotateY(radians: number): Matrix4
  rotateZ(radians: number): Matrix4
  rotateXYZ([rx, ry, rz]: number[]): Matrix4
  rotateAxis(radians:any, axis:any): Matrix4

  // Transforms

  // Transforms any 2, 3 or 4 element vector. 2 and 3 elements are treated as points
  transform(vector: number[], result: number[]): number[]

  // Transforms any 2 or 3 element array as point (w implicitly 1)
  transformAsPoint(vector: number[], result: number[]): number[]
  transformAsVector(vector: number[], result: number[]): number[]

  // three.js math API compatibility
  makeRotationX(radians: number): Matrix4
  makeTranslation(x: number, y: number, z: number): Matrix4

  // DEPRECATED in 3.0
  /** @deprecated Use Matrix4.transformAsPoint instead. */
  transformPoint(vector: number[], result?: number[]): number[]
  /** @deprecated Use Matrix4.transformAsPoint instead. */
  transformVector(vector: number[], result?: number[]): number[]
  /** @deprecated Use Matrix4.transformAsPoint instead. */
  transformDirection(vector: number[], result?: number[]): number[]
}

declare interface Viewer {
  viewMatrix:Matrix4
  projectionMatrix:Matrix4
  computeProjectionMatrix(width:number, height:number):Matrix4
  destroy():void
}

// 这个版本就是一个真正的纯2d viewer
declare interface BaseViewerParams {
  width?:number
  height?:number
}

// subscriber
declare interface NowCompute {
  callback:Callback,
  params?:Array<any>
}

declare interface PaperWingSubscriber {
  list:Dictionary<Array<any>>
  onceList:Dictionary<Array<any>>
  nextList:Dictionary<Array<any>>
  nowList:Array<NowCompute>
  history:Dictionary<Array<any>>
  sets:Dictionary<any>
  check():void
  register(eventName:string, useHistory?:boolean):void
  cancel(eventName:string):void
  listen(eventName:string, callback:Callback):void
  once(eventName:string, callback:Callback):void
  next(eventName:string, callback:Callback):void
  remove(eventName:string, callback:Callback):void
  broadcast(eventName:string, ...argus:Array<any>):void
  clear():void
  set(key:string, value:any):void
  get(key:string):any
}

// renderloop
declare interface LoopConfig {
  canvas:HTMLCanvasElement,
  subscriber:PaperWingSubscriber
  options?:AnimationLoopStartOptions
  glParams?:GLParams
}

declare interface AnimationLoopInitializeArguments {
  gl:GLContext
}

declare interface AnimationLoopRenderArguments {
  gl:GLContext,
  time:number
}

declare interface FrameCompute {
  callback:Callback,
  params?:Array<any>,
  before?:boolean
}

declare interface AnimationLoopStartOptions {
  canvas?:HTMLCanvasElement
  webgl2?:boolean
  webgl1?:boolean
  alpha?:boolean
  depth?:boolean
  stencil?:boolean
  antialias?:boolean
  premultipliedAlpha?:boolean
  preserveDrawingBuffer?:boolean
  failIfMajorPerformanceCaveat?:boolean
}

declare interface GLParams {
  depth?:boolean
}

// computeTexture
interface ComputeTextureConfig {
  name:string // 当这个texture被渲染后，应该可以被
  width:number
  height:number
  subscriber:PaperWingSubscriber,
  viewer?:Viewer,
  samplerRate?:number
}

// scene
declare interface RenderParams {
  uniforms:Dictionary<any>
  framebuffer?:any
}

// material
declare interface MaterialReceipt {
  vs:string
  fs:string
  uniforms:Dictionary<any>
  defines?:Dictionary<any>
}

declare interface StandardMaterialConfig {
  type: string,
  color?: RGBAColorArray // 基色
  texture?: string // 贴图，相比起三维中用uv来上贴图，这里需要单个值（对于条状部件来说，对于块状依然要uv）
  normalMap?: any // 法向量贴图，这里暂时用any代替等定义完了之后再替换过来，这里的normalMap是用于做几何调整，而且因为降维了，所以它会变成一个更加简单的数据结构
  uniformTextures: Array<string> // 一些会注入着色器中作为样本使用的贴图
  fs?:string
  vs?:string
  defines?:Dictionary<any>
  uniforms?:Dictionary<any>
}

declare interface PureColorMaterialConfig {
  type:string
  color:RGBAColorArray
}

declare interface Texture2DMaterialConfig {
  type:string
}

declare type MaterialConfig = PureColorMaterialConfig | Texture2DMaterialConfig | StandardMaterialConfig

// resource
declare type AssetGroup = Dictionary<string>

declare type Assets = Dictionary<string|AssetGroup>

declare type LoadedAssets = Dictionary<HTMLImageElement>

declare type LoadedAssetsGroup = Dictionary<HTMLImageElement | LoadedAssets>

declare interface LoadedImage {
  name:string
  url:string
  image:HTMLImageElement
}

declare interface ProgressStatus {
  total:number
  complete:number
  success:number
  failed:number
}

// geometry
declare type Bound = {
  width:number
  height:number
}

declare interface LumaGeometryConfig {
  positions:Array<number>
  normals:Array<number>
  indices:Array<number>
  uvs?:Array<number>
}

declare interface LineGeometryShapeConfig {
  type?: string
  start: Point
  end: Point
  thickness: number
}

declare interface RectGeometryShapeConfig {
  type?: string
  x?: number
  y?: number
  rotate?: number
  width: number
  height: number
  stroke?: number
}

declare type GeometryConfig = RectGeometryShapeConfig | LineGeometryShapeConfig

// decorator
declare interface ClassTypeName {
  classTypeName: string
}

// 用于描述绘制顺序的抽象类
declare interface GetSetRenderOrder {
  _renderOrder:number
  renderOrder:number
}

// 用于描述width接口的抽象类
declare interface GetSetWidth {
  _width:number
  width:number
}

// 用于描述height接口的抽象类
declare interface GetSetHeight {
  _height:number
  height:number
}

// 用于描述x接口的抽象类
declare interface GetSetX {
  _x:number
  x:number
}

// 用于描述y接口的抽象类
declare interface GetSetY {
  _y:number
  y:number
}

// 用于描述
declare interface MatrixManager2D {
  needRefreshMatrix:boolean
  _matrix:Matrix4
  computeMatrix():void
  // 平移
  _x:number
  x:number
  _y:number
  y:number
  // 缩放
  _scaleX:number
  scaleX:number
  _scaleY:number
  scaleY:number
  // 旋转
  _rotate:number
  rotate:number
}