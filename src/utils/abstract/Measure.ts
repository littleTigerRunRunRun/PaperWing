interface MeasureTarget {
  onWidthChange?(width?:number)
  onHeightChange?(height?:number)
  onXChange?(x?:number)
  onYChange?(y?:number)
}

function hasOnWidthChange(target:any):target is MeasureTarget {
  return target.onWidthChange !== undefined
}

function hasOnHeightChange(target:any):target is MeasureTarget {
  return target.onHeightChange !== undefined
}

function hasOnXChange(target:any):target is MeasureTarget {
  return target.onXChange !== undefined
}

function hasOnYChange(target:any):target is MeasureTarget {
  return target.onYChange !== undefined
}

// width和height的混合
export class SizeMixin {
  protected _width:number = 0
  public get width():number { return this._width }
  public set width(width:number) {
    if (width === this._width) return
    this._width = width

    if (hasOnWidthChange(this)) this.onWidthChange(width)
  }
  
  protected _height:number = 0
  public get height():number { return this._height }
  public set height(height:number) {
    if (height === this._height) return
    this._height = height
    
    if (hasOnHeightChange(this)) this.onHeightChange(height)
  }
}

// 用x和y表示方位的混合
export class PositionMixin {
  protected _x:number = 0
  public get x():number { return this._x }
  public set x(x:number) {
    if (x === this._x) return
    this._x = x

    if (hasOnXChange(this)) this.onXChange()
  }
  
  protected _y:number = 0
  public get y():number { return this._y }
  public set y(y:number) {
    if (y === this._y) return
    this._y = y
    
    if (hasOnYChange(this)) this.onYChange()
  }
}