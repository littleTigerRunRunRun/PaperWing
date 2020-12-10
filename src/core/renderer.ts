declare interface RendererConfig {
  canvas: HTMLCanvasElement
} 

export class Renderer {
  public canvas: HTMLCanvasElement

  constructor({ canvas }:RendererConfig) {
    this.canvas = canvas
  }
}
