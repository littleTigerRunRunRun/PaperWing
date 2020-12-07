declare interface GraphicEntry {
}

declare global {
  interface Window {
    PaperWing: typeof PaperWing
  }
}

export default class PaperWing implements GraphicEntry {
  private canvas: HTMLCanvasElement
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  draw() {
    const ctx:CanvasRenderingContext2D = this.canvas.getContext('2d')
    ctx.rect(0, 0, 100, 100)
    ctx.fillStyle = '#ccc'
    ctx.fill()
  }
}

window.PaperWing = PaperWing
