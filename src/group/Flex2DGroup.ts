import { Container2DGroup, Container2DGroupConfig } from './Container2DGroup'
import { isRenderable } from '../utils'

interface Flex2DGroupConfig extends Container2DGroupConfig {

}

// 有一部分有点类似flex布局，但是更为复杂
export class Flex2DGroup extends Container2DGroup {
  constructor({ name, width, height, helper = null }:Flex2DGroupConfig) {
    super({ name, width, height, helper })
  }

  render(...argus:Array<any>) {
    for (const child of this.children) {
      if (isRenderable(child)) {
        child.render(...argus)
      }
    }
  }
}