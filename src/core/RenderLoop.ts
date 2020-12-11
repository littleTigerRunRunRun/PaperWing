import { AnimationLoop } from '@luma.gl/engine'
import { GLContext } from '@/common'
import PWEvent from './Event'

declare interface LoopConfig {
  canvas:HTMLCanvasElement,
  options?:AnimationLoopStartOptions
}

declare interface AnimationLoopInitializeArguments {
  gl:GLContext
}

declare interface AnimationLoopRenderArguments {
  gl:GLContext,
  time:number
}

export declare interface AnimationLoopStartOptions {
  canvas?:HTMLCanvasElement
  webgl2?:boolean
  webgl1?:boolean
  alpha?:boolean
  depth?:boolean
  stencil?:boolean
  antialias?:boolean
  premultipliedAlpha?:boolean
  preserveDrawingBuffer?:boolean
  failIfMajorPerformanceCaveat?:boolean
}

// Loop是整个渲染流程的tick控制器
export class RenderLoop {
  public canvas:HTMLCanvasElement
  public gl:GLContext

  private loop:AnimationLoop
  
  constructor({ canvas, options = {} }:LoopConfig) {
    this.canvas = canvas

    this.initLoop(options)
  }

  private initLoop(options:AnimationLoopStartOptions) {
    // 注册事件
    PWEvent.register('loopRender')

    this.loop = new AnimationLoop({
      onInitialize: ({ gl }:AnimationLoopInitializeArguments) => {
        this.gl = gl

        return {}
      },
      onRender: ({ time }:AnimationLoopRenderArguments) => {
        PWEvent.broadcast('loopRender', { time })
      },
      // autoResizeViewport: false
      // useDevicePixels: true
    })
    this.loop.start(options)
  }

  destroy() {
    this.loop.delete()
  }
}