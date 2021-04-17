import { Dictionary } from '@/common'
import { ComputeTexture, ComputeTextureConfig } from '../computeTexture'
import { GetSetSize, GetSetNumber } from '../utils'
import { Framebuffer, Texture2D } from '@luma.gl/webgl'
// import Subscriber from '@/core/Subscriber'
import { Leaflike } from '../utils'
import { Shape, ShapeConfig } from '../index'

interface AtomShapeConfig extends ShapeConfig {
  atom:Atom
}

// 继承自Shape的AtomShape，用Atom描述一个Shape并且执行独有的vs和fs
class AtomShape extends Shape {
  public atom:Atom

  constructor(config:AtomShapeConfig) {
    super(config)

    this.atom = config.atom
  }
}

// 将0 - 1的grey映射到0 - 1的另一个范围
const DEFAULT_GREY_MAP = function(grey) {
  return grey
}

// 有三种类型：solid / linear / pattern
type AtomType = 'solid' | 'linear' | 'pattern'

export interface AtomConfig {
  name?:string // 可有可无
  type?:AtomType
  x?:number
  y?:number
  width?:number
  height?:number
  rotate?:number // 使用时的旋转
  flipX?:boolean // x轴翻转
  flipY?:boolean // y轴翻转
  grey?:number // solid模式下的灰度值
  // greyMap和greyParams是linear类型使用的，linear我们默认是从0-1的grey变化，那么如果需要0.2 - 0.8,这个范围就要被被操作一个函数x * 0.6 + 0.2，这就是greyMap，而有可能会出现函数中需要传参的，就是greyParams
  greyMap?:Function // 参与笔刷构建时的grey值映射方式
  greyParams?:Dictionary<any> // 可能用于参与greyMap的参数
  // PATTERN模式下，Atom将是一个贴图
  texture?:string
}

// 原子化素材，这个类主要是一个数据类，它的数据使用在Brush中有所体现
export class Atom extends Leaflike {
  public type:AtomType

  public x:number = 0
  public y:number = 0
  public width:number = 0
  public height:number = 0

  public flipX:boolean = false
  public flipY:boolean = false
  public rotate:number = 0

  public grey:number = 1
  public greyParams:Dictionary<any>
  public greyMap:Function
  public texture:string = ''
  public shape:AtomShape
  constructor({ name = '', type = 'solid', x, y, width, height, texture = '', grey = 1, greyMap = DEFAULT_GREY_MAP, greyParams = {}, flipX = false, flipY = false, rotate = 0 }:AtomConfig) {
    super({ name })

    this.type = type

    this.x = x
    this.y = y
    this.width = width
    this.height = height

    this.flipX = flipX
    this.flipY = flipY
    this.rotate = rotate

    this.grey = grey
    this.texture = texture
    this.greyMap = greyMap
    this.greyParams = greyParams

    const material = {
      type: 'standard',
      texture: '',
      color: { r: 0, g: 0, b: 0, a: 1 }
    }
    if (this.texture) material.texture = this.texture
    if (this.grey) material.color.r = material.color.g = material.color.b = this.grey
    this.shape = new AtomShape({
      name: this.name,
      atom: this,
      geometry: { type: 'rect', width: this.width, height: this.height },
      material
    })
    // console.log(this.shape)
  }
}

// 邻接笔刷自动插值功能
// 笔刷是否可以设置粗细的问题：可以将一个笔刷设置成可以调节粗细，但是这需要笔刷本身在竖直方向上可拉伸
type BrushThicknessAdjustableType = 'NONE' | 'NORMAL' | 'TOGETHER'

// 任何一个笔刷中的元素都会保持同一种填充模式，如果遇到需要复杂填充模式的情况，请使用复合笔刷（即在一个rect中采用多个笔刷）
type BrushRepeatWay = 'NONE' | 'REPEAT' | 'CLAMP' | 'MIRROR'

export interface Brush extends GetSetSize {}

// 笔刷是一种绘制对象，输入宽高之后，按照既定的绘制逻辑，更新一个材质。
@GetSetNumber('width', 0)
@GetSetNumber('height', 0)
export class Brush extends ComputeTexture {
  protected atomMap:Dictionary<Atom> = {}

  get texture():Texture2D { return this.buffer.texture }

  constructor(config:ComputeTextureConfig) {
    super(config)
  }
  
  public onWidthChange(width:number) {}

  // Brush只允许添加Atom类型作为其子元素，绘制时读取的是
  public add(child:Atom):number {
    if (child.parent === this) return

    // 添加给Brush的参数是Atom，但是添加给ComputeTexture绘制逻辑的是Atom.shape
    const index = super.add(child.shape)
    child.shape.setSubscriber(this.subscriber)
    this.atomMap[index] = child // 可以使用index找到Atom

    return index
  }
}
