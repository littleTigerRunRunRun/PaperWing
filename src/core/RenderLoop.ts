import { AnimationLoop } from '@luma.gl/engine'
import { setParameters } from '@luma.gl/gltools'
import GL from '@luma.gl/constants'
import { Dictionary, GLContext } from '@/common'
import Subscriber from './Subscriber'
import { mixin } from '../utils'

interface LoopConfig {
  canvas:HTMLCanvasElement,
  subscriber:Subscriber
  options?:AnimationLoopStartOptions
  glParams?:GLParams
}

interface AnimationLoopInitializeArguments {
  gl:GLContext
}

interface AnimationLoopRenderArguments {
  gl:GLContext,
  time:number
}

interface FrameCompute {
  callback:Function,
  params?:Array<any>,
  before?:boolean
}

export interface AnimationLoopStartOptions {
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

export interface GLParams {
  depth?:boolean
}

export class RenderLoopCarrier {
  protected loop:RenderLoop
  protected subscriber:Subscriber

  public tick(callback:Function) {
    this.subscriber.listen('loopRender', callback)
  }

  public removeTick(callback:Function) {
    this.subscriber.remove('loopRender', callback)
  }

  public addFrameCompute(compName:string, frameCompute:FrameCompute) {
    this.loop.addFrameCompute(compName, frameCompute)
  }

  // 外部监听一些内部事件
  public bind(eventName:string, callback:Function) {
    this.subscriber.listen(eventName, callback)
  }

  // 取消一个监听
  public unbind(eventName:string, callback:Function) {
    this.subscriber.remove(eventName, callback)
  }

  public once(eventName:string, callback:Function) {
    this.subscriber.once(eventName, callback)
  }
}

export function makeRenderLoopCarrier<T extends {new(...args:any[]):{}}>(constructor:T) {
  mixin(constructor, [RenderLoopCarrier])
  return constructor
}

// Loop是整个渲染流程的tick控制器
export class RenderLoop {
  public canvas:HTMLCanvasElement
  public gl:GLContext
  public get version() {
    return (this.gl as any)._version
  }

  private loop:AnimationLoop
  private frameComputes:Dictionary<FrameCompute> = {}
  private subscriber:Subscriber
  
  constructor({ canvas, subscriber, options = {}, glParams = {} }:LoopConfig) {
    this.canvas = canvas
    this.subscriber = subscriber

    this.initLoop(options, glParams)
  }

  private initLoop(options:AnimationLoopStartOptions, glParams:GLParams) {
    // 注册事件
    this.subscriber.register('loopRender')
    this.subscriber.register('getGl', true)

    this.loop = new AnimationLoop({
      onInitialize: ({ gl }:AnimationLoopInitializeArguments):any => {
        this.gl = gl
        this.subscriber.broadcast('getGl', gl)
        
        const { depth = true } = glParams
        setParameters(gl, {
          depthTest: depth,
          cull: true,
          cullFace: GL.BACK,
          blendFunc: [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE]
          // depthFunc: gl.LEQUAL
        })

        return {
          gl
        }
      },
      onRender: ({ time }:AnimationLoopRenderArguments) => {
        // 前帧计算的响应
        for (const key in this.frameComputes) {
          const { before, callback, params } = this.frameComputes[key]
          if (before) {
            callback.apply(this, params)
            this.frameComputes[key] = null
            delete this.frameComputes[key]
          }
        }

        this.subscriber.broadcast('loopRender', { time })

        // 后帧计算的响应
        for (const key in this.frameComputes) {
          const { before, callback, params } = this.frameComputes[key]
          if (!before) {
            callback.apply(this, params)
            this.frameComputes[key] = null
            delete this.frameComputes[key]
          }
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