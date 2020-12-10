export function mixin(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    console.log(baseCtor.children)
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      console.log(name)
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
      )
    })
  })
}