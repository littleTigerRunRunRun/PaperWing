import { 
  Scene,
  Shape,
  BaseViewer
} from '../../src/index'

// 测试程序，测试Tree/Leaf结构API的正确性
export default function main(canvas: HTMLCanvasElement) {
  const scene:Scene = new Scene({ canvas, stats: false })
  const viewer:BaseViewer = new BaseViewer()
  scene.viewer= viewer

  const rect1:Shape = new Shape({
    name: 'test',
    geometry: {
      type: 'rect',
      config: { width: 100, height: 100, stroke: 0, x: 0, y: 0, rotate: 0 }
    },
    material: {
      type: 'pure',
      config: { r: 1, g: 0.3, b: 0.2, a: 1 }
    }
  })
  scene.add(rect1)

  scene.tick(({ time }) => {
    rect1.x = Math.sin(time * 0.002 + Math.PI * 0.5) * 200
    rect1.rotate = time * 0.002
  })
}
