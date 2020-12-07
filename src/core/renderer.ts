declare interface Renderer {
  target: HTMLCanvasElement
}

export default class BaseRenderer implements Renderer {
  target: HTMLCanvasElement
  constructor(target?: HTMLCanvasElement) {
    this.target = target
  }
}
