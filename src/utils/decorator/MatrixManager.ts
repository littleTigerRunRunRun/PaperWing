// 目前暂且没有参数
export function MatrixManager2D(property?:string) {
  return function<T extends {new(...args:any[]):{}}>(constructor:T) {
    const defines = {}
    defines['x'] = { value: 0, writable: true }
    defines['y'] = { value: 0, writable: true }
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