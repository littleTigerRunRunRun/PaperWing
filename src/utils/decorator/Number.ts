export function GetSetNumber(property:string, defaultValue:number = 0) {
  return function<T extends {new(...args:any[]):{}}>(constructor:T) {
    const defines = {}
    defines[`_${property}`] = { value: defaultValue, writable: true }
    defines[property] = {
      get() {
        return this[`_${property}`]
      },
      set(value:number) {
        if (this[`_${property}`] === value) return

        const callbackName = `on${property[0].toUpperCase() + property.slice(1)}Change`
        this[`_${property}`] = value
        if (this[callbackName]) this[callbackName](value)
      }
    }
    Object.defineProperties(constructor.prototype, defines)
    return constructor
  }
}

// 用于描述width接口的抽象类
export class GetSetWidth {
  _width:number
  get width():number{ return this._width }
  set width(width:number) {}
}

// 用于描述height接口的抽象类
export class GetSetHeight {
  _height:number
  get height():number{ return this._height }
  set height(height:number) {}
}

// 用于描述x接口的抽象类
export class GetSetX {
  _x:number
  get x():number{ return this._x }
  set x(height:number) {}
}

// 用于描述y接口的抽象类
export class GetSetY {
  _y:number
  get y():number{ return this._y }
  set y(y:number) {}
}

// 用于描述绘制顺序的抽象类
export class GetSetRenderOrder {
  _renderOrder:number
  get renderOrder():number { return this._renderOrder }
  set renderOrder(renderOrder:number) {}
}
