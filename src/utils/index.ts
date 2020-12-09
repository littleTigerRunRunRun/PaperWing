// 累加器
export class Accumulator {
  private index:number = 0
  add():number {
    return this.index++
  }
}

// log工具
export function log(message, module, type) {
  // 根据level和开发者手动调整的过滤level，可以动态选择哪些信息需要展示
}