export declare interface StringDictionary {
  [key:string]:string
}

export declare interface AnyDictionary {
  [key:string]:any
}

export declare interface ImageSource {
  key: string,
  promise: Promise<HTMLImageElement>
}

export type GLContext = WebGLRenderingContext | WebGL2RenderingContext