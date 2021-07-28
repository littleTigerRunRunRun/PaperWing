export function GetSetNumber(property:string, defaultValue:number = 0) {
  return function<T extends {new(...args:any[]):{}}>(constructor:T) {
    const defines:Dictionary<any> = {}
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

export interface GetSetSize extends GetSetWidth, GetSetHeight {}
@GetSetNumber('width')
@GetSetNumber('height')
export class GetSetSize {}

export interface GetSetPosition extends GetSetX, GetSetY {}
@GetSetNumber('x')
@GetSetNumber('y')
export class GetSetPosition {}

export interface GetSetBound extends GetSetX, GetSetY, GetSetWidth, GetSetHeight {}
@GetSetNumber('width')
@GetSetNumber('height')
@GetSetNumber('x')
@GetSetNumber('y')
export class GetSetBound {}
