import { PWPoint } from '@/common'
import { Vector2 } from 'math.gl'
import { Geometry } from '@luma.gl/engine'

// 用于给各种Geometry实现用的接口
export interface GeometryStandard {
  length:number
  points:Array<PWPoint>
  normals:Array<Vector2>
  indices:Array<number>
  geometry:Geometry
  config:any
  refreshConfig(config:any)
  refreshGeometry(config:any)
  generatePoints(...argus:Array<any>):Bound // 根据参数，生成标准化的几何，并且要返还无位置包围盒
  fragmentate() // 根据参数，将几何内容计算成标准的片元顶点集合
}

type Bound = {
  width:number
  height:number
}

interface LumaGeometryConfig {
  positions:Array<number>
  normals:Array<number>
  indices:Array<number>
}

// 对luma Geometry对象的基本包装以方便使用
class LumaGeometry extends Geometry {
  constructor({ positions = [], normals = [], indices = [] }:LumaGeometryConfig) {
    super({
      indices: { size: 1, value: new Uint16Array(indices) },
      attributes: {
        // x,y,z,w
        POSITION: { size: 4, value: new Float32Array(positions) },
        NORMAL: { size: 3, value: new Float32Array(normals) }
      }
    })
  }

  rebuild({ positions = [], normals = [], indices = [] }:LumaGeometryConfig) {
    this._setAttributes(
      { POSITION: { size: 4, value: new Float32Array(positions) }, NORMAL: { size: 3, value: new Float32Array(normals) } },
      { size: 1, value: new Uint16Array(indices) }
    );
    (this as any).vertexCount = indices.length
  }
}

// 几何类型的基类
export class BaseGeometry implements GeometryStandard {
  public length:number = 0
  public points:Array<PWPoint> = []
  public normals:Array<Vector2> = []
  public indices:Array<number> = []
  public geometry:LumaGeometry
  public bound:Bound
  public config:any
  
  public matrixNeedRefresh:boolean = true

  // translate
  protected _x:number = 0
  protected _y:number = 0
  public get x():number { return this._x }
  public set x(x:number) {
    if (x === undefined || this._x === x) return
    this._x = x
    this.matrixNeedRefresh = true
  }
  public get y():number { return this._y }
  public set y(y:number) {
    if (y === undefined || this._y === y) return
    this._y = y
    this.matrixNeedRefresh = true
  }

  // rotate
  protected _rotate:number = 0
  public get rotate():number { return this._rotate }
  public set rotate(rotate:number) {
    if (rotate === undefined || this._rotate === rotate) return
    this._rotate = rotate
    this.matrixNeedRefresh = true
  }

  /************ CONSTRUCTOR ************/
  constructor(config:any) {
    this.refreshGeometry(config)
  }

  // 传入config然后赋值
  public refreshConfig(config:any) {
    this.x = config.x || 0
    this.y = config.y || 0
    this.rotate = config.rotate || 0
  }

  public refreshGeometry(config:any) {
    this.refreshConfig(config)

    // 将输入的参数转化成点
    this.bound = this.generatePoints()

    // 计算法向量
    this.computeClosedNormals()

    // 计算描边形状的顶点
    // console.log(stroke)

    // 片元化
    this.fragmentate()

    // 构建Geometry对象
    this.buildGeometry()
  }

  // 求出闭合图形每个点的法向量
  protected computeClosedNormals() {
    for (let i = 0; i < this.points.length; i++) {
      const nextPoint = this.points[i + 1] ? this.points[i + 1] : this.points[0]
      const prevPoint = this.points[i - 1] ? this.points[i - 1] : this.points[this.points.length - 1]
      this.normals.push(new Vector2(this.points[i].x * 2 - nextPoint.x - prevPoint.x, this.points[i].y * 2 - nextPoint.y - prevPoint.y).normalize())
    }
  }

  protected buildGeometry() {
    // 计算顶点位置、法向量
    const positions = []
    this.points.forEach((point) => positions.push(...[point.x, point.y, point.z, point.w]))

    const normals = []
    this.normals.forEach((normal, index) => normals.push(...[normal.x, normal.y, this.points[index].z]))

    if (!this.geometry) this.geometry = new LumaGeometry({ positions, normals, indices: this.indices })
    else this.geometry.rebuild({ positions, normals, indices: this.indices })
  }

  public generatePoints(...argus:Array<any>):Bound {
    // console.log('generate')
    return { width: 0, height: 0 }
  }

  // 将普通的用于描述连线的顶点通过某些方法连接起来，形成诸多三角形，本方法只适用于凸多边形
  public fragmentate() {
    const points = this.points.map((point, index) => index) // 以6变形为例测试
    this.indices.splice(0, this.indices.length)

    for (let i = 0; i < points.length; i++) {
      // 从现在开始的顶点起，往后数2个点构成一个三角形
      this.indices.push(points[i], points[i + 1], points[i + 2] || points[0])
      // 将中间那个点剔除，因为后续的三角形构建一定用不到了，index往后加一个，以避免出现连续小三角
      points.splice(i + 1, 1)
      i++
      // 当后续可以成三角形的点不足2个了，并且剩余的点还有3个或以上，则i返回到0重新运行逻辑
      if (!points[i + 2] && points.length > 2) i = 0
    }
  }

  public destroy() {
    
  }
}