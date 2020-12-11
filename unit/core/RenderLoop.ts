import Event from '../../src/core/Event'
import { RenderLoop } from '../../src/core/RenderLoop'

// 测试程序，测试Event API的正确性
export default function main(canvas: HTMLCanvasElement) {
  const loop = new RenderLoop({ canvas })

  Event.listen('loopRender', (time) => {
    console.log(time)
  })
}
