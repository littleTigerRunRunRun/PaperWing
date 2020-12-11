export declare interface Dictionary<T> {
  [key:string]:T
}

export declare interface ImageSource {
  key: string,
  promise: Promise<HTMLImageElement>
}

export type GLContext = WebGLRenderingContext | WebGL2RenderingContext
