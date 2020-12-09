import PaperWing from '../index'
const { Scene } = PaperWing

// 测试程序，尝试用纸翼构建星轨
export default function main(canvas: HTMLCanvasElement) {
  const scene = new Scene({ canvas })
  console.log(scene)
  // scene.add()
}