import { AnimationLoop } from '@luma.gl/engine'
import { Dictionary, GLContext } from '@/common'
import PWSubscriber from './Subscriber'

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

declare interface FrameCompute {
  callback:Function,
  params?:Dictionary<any>,
  before?:boolean
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
  private frameComputes:Dictionary<FrameCompute> = {}
  
  constructor({ canvas, options = {} }:LoopConfig) {
    this.canvas = canvas

    this.initLoop(options)
  }

  private initLoop(options:AnimationLoopStartOptions) {
    // 注册事件
    PWSubscriber.register('loopRender')

    this.loop = new AnimationLoop({
      onInitialize: ({ gl }:AnimationLoopInitializeArguments) => {
        this.gl = gl

        return {}
      },
      onRender: ({ time }:AnimationLoopRenderArguments) => {
        // 前帧计算的响应
        for (const key in this.frameComputes) {
          const { before, callback, params } = this.frameComputes[key]
          if (before) callback.apply(this, params)
        }

        PWSubscriber.broadcast('loopRender', { time })

        // 后帧计算的响应
        for (const key in this.frameComputes) {
          const { before, callback, params } = this.frameComputes[key]
          if (!before) callback.apply(this, params)
        }
      },
      // autoResizeViewport: false
      // useDevicePixels: true
    })
    this.loop.start(Object.assign({ canvas: this.canvas }, options))
  }

  // 帧计算:用户可能在循环中对同一个计算提交了多次，但其实在可视化中，一帧一次以外的频率都是浪费，因此这里就涉及到了帧计算的优化点
  // 定义一个名为compName的帧计算类型，这种计算的callback会被暂存，在一帧的末尾，同类型的帧计算，后来的会顶替旧的，最终执行一次
  public addFrameCompute(compName:string, frameCompute:FrameCompute) {
    this.frameComputes[compName] = frameCompute
  }

  destroy() {
    this.loop.delete()
  }
}