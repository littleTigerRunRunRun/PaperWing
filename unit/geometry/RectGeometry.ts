import { 
  Scene,
  Shape
} from '../../src/index'

// 测试程序，测试Tree/Leaf结构API的正确性
export default function main(canvas: HTMLCanvasElement) {
  const scene:Scene = new Scene({ canvas })
  const rect1:Shape = new Shape({
    name: 'test',
    geometry: {
      type: 'rect',
      config: {
        width: 200,
        height: 100,
        stroke: 4
      }
    }
  })

  scene.add(rect1)
  console.log(rect1)
}
