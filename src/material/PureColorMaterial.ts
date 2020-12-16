export interface PureColorMaterialConfig {
  r:number
  g:number
  b:number
  a:number
}

export class PureColorMaterial {
  public r:number = 0
  public g:number = 0
  public b:number = 0
  public a:number = 0

  constructor({ r, g, b, a }: PureColorMaterialConfig) {
    console.log(r, g, b, a)
  }
}