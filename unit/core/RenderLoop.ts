import Subscriber from '../../src/core/Subscriber'
import { RenderLoop } from '../../src/core/RenderLoop'

// 测试程序，测试Event API的正确性
export default function main(canvas: HTMLCanvasElement) {
  const subscriber = new Subscriber()
  const loop = new RenderLoop({ canvas, subscriber })

  // 由于绘制部分仍未完成，先使用一个其他的画布来测试Loop
  const canvas2 = document.createElement('canvas')
  canvas2.style.width = '100%'
  canvas2.style.height = '100%'
  canvas2.style.left = '0px'
  canvas2.style.top = '0px'
  canvas2.style.position = 'fixed'
  document.body.appendChild(canvas2)

  const ctx:CanvasRenderingContext2D = canvas2.getContext('2d')
  const { width, height } = canvas2.getBoundingClientRect()
  canvas2.width = width
  canvas2.height = height
  const squareSize = 20
  ctx.fillStyle = '#000'

  let count = 0

  subscriber.listen('loopRender', ({ time }) => {
    ctx.beginPath()
    ctx.rect(0, 0, width, height)
    ctx.closePath()
    ctx.fillStyle = '#fff'
    ctx.globalAlpha = 0.02
    ctx.fill()

    const x = Math.sin(time * 0.002 + Math.PI * 0.5) * 200 + width * 0.5 - 50 * 0.5
    const y = Math.sin(time * 0.004) * 60 + height * 0.5 - 50 * 0.5

    // console.log(time, Math.sin(time))
    // console.log()
    // console.log(x, y, squareSize)
    ctx.beginPath()
    ctx.arc(x, y, squareSize, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fillStyle = '#000'
    ctx.globalAlpha = 1
    ctx.fill()

    // 帧计算的测试，当然真正的环境下，loop.addFrameCompute会在Scene的实例上暴露出来
    // 虽然每帧循环了100次，但是只会执行一次
    for (let i = 0; i < 100; i++) {
      loop.addFrameCompute('count', {
        callback: () => {
          count++
        }
      })
    }
    // console.log(count)
  })
}
