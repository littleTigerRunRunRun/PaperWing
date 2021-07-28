// 常量
export { constantValue } from './shader/constant'
// 用于混合还有继承的抽象类(有一些特殊用途的抽象类被放在了对应的文件中，没有收录在这里)
export { Treelike, Leaflike, Branchlike, childlike, parentlike } from './abstract/TreeAndLeaf'
// 装饰类
export { GetSetNumber, GetSetBound, GetSetPosition, GetSetSize } from './decorator/Number'
export { GetSetAny } from './decorator/Common'
export { BuildMatrixManager2D } from './decorator/MatrixManager'
export { SignClassTypeName } from './decorator/ClassTypeName'
// 断言 
export { isRenderable, isString } from './assert/index'

// 累加器
export class Accumulator {
  private index:number = 0
  add():number {
    return this.index++
  }
}

// 将类混合进别的类的原型中
export function mixin(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) as any
      )
    })
  })
}

// log工具
// export function log(message, module, type) {
  // 根据level和开发者手动调整的过滤level，可以动态选择哪些信息需要展示
// }