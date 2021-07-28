interface Renderable {
  render(...argus:Array<any>):void
}

export function isRenderable(target:any): target is Renderable {
  return target.render !== undefined
}

export function isString(target:any): target is string {
  return typeof target === 'string'
}