export declare interface Dictionary<T> {
  [key:string]:T
}

export declare interface ImageSource {
  key: string,
  promise: Promise<HTMLImageElement>
}

export type GLContext = WebGLRenderingContext | WebGL2RenderingContext

// 一般用于分离参数，比如传递事件 emit(eventName, arg1, arg2...)，通过toArray可以将eventName以外的参数分离出来传递给回调参数
export function toArray (list:Array<any>, start:number = 0) {
  let i = list.length - start
  const ret:Array<any> = new Array(i)
  while (i--) {
      ret[i] = list[i + start]
  }
  return ret
}