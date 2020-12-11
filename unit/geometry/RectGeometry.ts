import { 
  Scene,
  Shape
} from '@/index'

// 测试程序，测试Tree/Leaf结构API的正确性
export default function main(canvas: HTMLCanvasElement) {
  const scene:Scene = new Scene({ canvas })
  const rect1:Shape = new Shape({
    geometry: {
      type: 'rect',
      config: {
        width: 100,
        height: 100
      }
    }
  })

  scene.add(rect1)
}
