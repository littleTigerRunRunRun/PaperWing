import { PWPoint, Point } from '@/common'
import { Vector2 } from 'math.gl'
import { Geometry } from '@luma.gl/engine'
import { GetSetBound, GetSetNumber, GetSetSize } from '../utils'

// 用于给各种Geometry实现用的接口
export interface GeometryStandard {
  stroke?:number
  length:number
  points:Array<PWPoint>
  uvs:Array<Point>
  normals:Array<Vector2>
  indices:Array<number>
  geometry:Geometry
  config:any
  _refreshConfig(config:any)
  _refreshGeometry(config:any)
  _generatePoints(...argus:Array<any>):Bound // 根据参数，生成标准化的几何，并且要返还无位置包围盒
  _fragmentate() // 根据参数，将几何内容计算成标准的片元顶点集合
  _strokeFragmentate?()
}

type Bound = {
  width:number
  height:number
}

interface LumaGeometryConfig {
  positions:Array<number>
  normals:Array<number>
  indices:Array<number>
  uvs?:Array<number>
}

// 对luma Geometry对象的基本包装以方便使用
class LumaGeometry extends Geometry {
  constructor({ positions = [], normals = [], indices = [], uvs = [] }:LumaGeometryConfig) {
    super({
      indices: { size: 1, value: new Uint16Array(indices) },
      attributes: {
        // x,y,z,w
        POSITION: { size: 4, value: new Float32Array(positions) },
        NORMAL: { size: 3, value: new Float32Array(normals) },
        uv: { size: 2, value: new Float32Array(uvs) }
      }
    })
  }

  rebuild({ positions = [], normals = [], indices = [], uvs = [] }:LumaGeometryConfig) {
    this._setAttributes(
      { POSITION: { size: 4, value: new Float32Array(positions) }, NORMAL: { size: 3, value: new Float32Array(normals) }, uv: { size: 2, value: new Float32Array(uvs) } },
      { size: 1, value: new Uint16Array(indices) }
    );
    (this as any).vertexCount = indices.length
  }
}

export interface BaseGeometry extends GetSetBound {}
// 几何类型的基类
@GetSetNumber('width')
@GetSetNumber('height')
@GetSetNumber('x')
@GetSetNumber('y')
export class BaseGeometry implements GeometryStandard {
  protected dimension:number
  public length:number = 0
  public points:Array<PWPoint> = []
  public uvs:Array<Point> = []
  public normals:Array<Vector2> = []
  public indices:Array<number> = []
  public geometry:LumaGeometry
  public strokeGeometry:LumaGeometry
  public stroke:number = 0
  public strokePoints:Array<PWPoint> = []
  public strokeIndices:Array<number> = []
  public config:any
  
  public matrixNeedRefresh:boolean = true
  public geometryNeedRefresh:boolean = false

  onXChange() { this.matrixNeedRefresh = true }
  onYChange() { this.matrixNeedRefresh = true }

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
    const { dimension = 2 } = config
    this.dimension = dimension

    this._refreshGeometry(config)
  }

  // 传入config然后赋值
  public _refreshConfig(config:any) {
    // this.x = config.x
    // this.y = config.y
    this.rotate = config.rotate || 0
  }

  public _refreshGeometry = (config?:any) => {
    if (!config) config = this.config
    this._refreshConfig(config)

    // 将输入的参数转化成点
    const { width, height } = this._generatePoints()
    this.width = width
    this.height = height

    // 计算法向量
    this.computeClosedNormals()

    // 如果有stroke这个概念，则需要校正点，并且生成stroke的geometry
    if (this.stroke) this._strokeFragmentate()

    // 片元化
    this._fragmentate()

    // 构建Geometry对象
    this.buildGeometry()
  }

  // 求出闭合图形每个点的法向量
  protected computeClosedNormals() {
    this.normals.splice(0, this.normals.length)

    for (let i = 0; i < this.points.length; i++) {
      const nextPoint = this.points[i + 1] ? this.points[i + 1] : this.points[0]
      const prevPoint = this.points[i - 1] ? this.points[i - 1] : this.points[this.points.length - 1]
      const v1 = new Vector2(this.points[i].x - nextPoint.x, this.points[i].y - nextPoint.y).normalize()
      const v2 = new Vector2(this.points[i].x - prevPoint.x, this.points[i].y - prevPoint.y).normalize()
      v1.add(v2)
      v1.normalize()
      this.normals.push(v1)
    }
  }

  protected buildGeometry() {
    // 计算顶点位置、法向量
    const positions = []
    this.points.forEach((point) => positions.push(...[point.x, point.y, point.z, point.w]))

    const normals = []
    // console.log(this.points, this.normals)
    this.normals.forEach((normal, index) => normals.push(...[normal.x, normal.y, this.points[index].z]))

    const uvs = []
    this.uvs.forEach((uv) => { uvs.push(...[uv.x, uv.y]) })

    if (!this.geometry) this.geometry = new LumaGeometry({ positions, normals, uvs, indices: this.indices })
    else this.geometry.rebuild({ positions, normals, indices: this.indices })

    if (this.stroke) {
      const strokePositions = []
      this.strokePoints.forEach((point) => strokePositions.push(...[point.x, point.y, point.z, point.w]))

      const strokeNormals = []
      this.normals.forEach((normal, index) => strokeNormals.push(...[normal.x, normal.y, this.points[index].z]))
      this.normals.forEach((normal, index) => strokeNormals.push(...[normal.x, normal.y, this.points[index].z]))

      this.strokeGeometry = new LumaGeometry({ positions: strokePositions, normals: strokeNormals, indices: this.strokeIndices })
      // if (!this.strokeGeometry) this.strokeGeometry = new LumaGeometry({ positions: strokePositions, normals: strokeNormals, indices: this.strokeIndices })
      // else this.strokeGeometry.rebuild({ positions: strokePositions, normals: strokeNormals, indices: this.strokeIndices })
    }
  }

  public _generatePoints(...argus:Array<any>):Bound {
    // console.log('generate')
    return { width: 0, height: 0 }
  }

  // 将普通的用于描述连线的顶点通过某些方法连接起来，形成诸多三角形，本方法只适用于凸多边形
  public _fragmentate() {
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

  public _strokeFragmentate() {
    // 根据normal修正
    this.strokePoints.splice(0, this.strokePoints.length)
    this.strokeIndices.splice(0, this.strokeIndices.length)

    for (let i = 0;i < this.points.length; i++) {
      const offsetVector = this.normals[i].clone().multiplyScalar(this.stroke * -0.5)
      const strokePoint = Object.assign({}, this.points[i])
      
      this.points[i].x += offsetVector.x
      this.points[i].y += offsetVector.y
      strokePoint.x -= offsetVector.x
      strokePoint.y -= offsetVector.y

      this.strokePoints.push(strokePoint)
    }
    this.strokePoints.splice(0, 0, ...this.points)

    const pLength = this.points.length
    for (let i = 0; i < pLength; i++) {
      if (i === pLength - 1) {
        this.strokeIndices.push(i)
        this.strokeIndices.push(i + pLength)
        this.strokeIndices.push(pLength)
        this.strokeIndices.push(pLength)
        this.strokeIndices.push(0)
        this.strokeIndices.push(i)
      } else {
        this.strokeIndices.push(i)
        this.strokeIndices.push(i + pLength)
        this.strokeIndices.push(i + pLength + 1)
        this.strokeIndices.push(i + pLength + 1)
        this.strokeIndices.push(i + 1)
        this.strokeIndices.push(i)
      }
    }
  }

  public destroy() {
    
  }
}
