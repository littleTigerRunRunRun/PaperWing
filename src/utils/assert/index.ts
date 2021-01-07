interface Renderable {
  render(...argus:Array<any>)
}

export function isRenderable(target:any): target is Renderable {
  return target.render !== undefined
}