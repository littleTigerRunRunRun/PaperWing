export function GetSetAny(property:string, defaultValue:any) {
  return function<T extends {new(...args:any[]):{}}>(constructor:T) {
    const defines = {}
    defines[`_${property}`] = { value: defaultValue, writable: true }
    defines[property] = {
      get() {
        return this[`_${property}`]
      },
      set(value:any) {
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