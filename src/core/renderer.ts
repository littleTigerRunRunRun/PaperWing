declare interface RendererConfig {
  canvas: HTMLCanvasElement
} 

export class Renderer {
  canvas: HTMLCanvasElement
  constructor({ canvas }:RendererConfig) {
    this.canvas = canvas
  }
}
