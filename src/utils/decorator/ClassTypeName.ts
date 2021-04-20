export class ClassTypeName {
  classTypeName
}

// 目前暂且没有参数
export function SignClassTypeName(typeName:string) {
  return function<T extends {new(...args:any[]):{}}>(constructor:T) {
    const defines = {
      classTypeName: {
        value: typeName,
        writable: false
      }
    }

    Object.defineProperties(constructor.prototype, defines)
    return constructor
  }
}