import { 
  Scene,
  Shape
} from '../../../src/index'

// 测试程序，测试Tree/Leaf结构API的正确性
export default function main(canvas: HTMLCanvasElement) {
  const scene:Scene = new Scene({ canvas })

  const shape:Shape = new Shape({
    geometry: { type: 'rect', width: 100, height: 100 },
    material: { type: 'pure', r: 1, g: 0.3, b: 0.2, a: 1 }
  })
  shape.name = 'testShape'

  const shapeIndex:number = scene.add(shape)

  // 测试查找接口
  console.log(scene.getChildByIndex(shapeIndex))
  console.log(scene.getChildByName('testShape'))
  console.log(shape.parent)
  console.log(scene.children.length)

  // 测试remove正确性
  scene.remove(shape)
  // scene.remove(shapeIndex)
  // scene.remove('testShape')
  console.log(shape.parent)
  console.log(scene.children.length)
}
