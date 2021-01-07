import { Branchlike, childlike, isRenderable } from '../utils'

// Group会传递render，但是在这期间，它会将一些共通的属性给传递下去，但是BaseGroup仅仅是一个聚类作用
export class BaseGroup extends Branchlike {
  public add(child:childlike):number {
    if (child.parent === this) return

    const index = super.add(child)
    if (this.subscriber) child.setSubscriber(this.subscriber)

    return index
  }

  public setSubscriber(subscriber) {
    this.subscriber = subscriber

    for (const child of this.children) {
      child.setSubscriber(subscriber)
    }
  }

  // 传递render
  render(...argus:Array<any>) {
    for (const child of this.children) {
      if (isRenderable(child)) {
        child.render(...argus)
      }
    }
  }
}