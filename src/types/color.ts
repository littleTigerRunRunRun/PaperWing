// 颜色类型

// rgba颜色字符串
// example1: 'rgba(255, 255, 255, 1)
// example2: 'rgba(100,100,200,0.5)
export type RGBAColor = string

export function isRGBAColor() {

}

// rgb颜色字符串
// example1: 'rgb(255, 255, 255)
// example2: 'rgb(100,100,200)
export type RGBColor = string

export function isRGBColor() {

}

// 归一化颜色数组
// example1: [1, 1, 1, 1]
// example2: [0.45, 0.45, 0.45, 0.5]
export type NormalizeArrayColor = Array<number>[4]

export function isNormalizeArrayColor() {

}

// 十六进制字符串
// example1: '#ffffff / '#fff'
// example2: '#7777ee' / '#77e'
export type String16bitColor = string

export function isString16bitColor() {

}

// 十六进制数字
// example1: 0xffffff
// example2: 0x7777ee
export type Number16bitColor = number

export function isNumber16bitColor() {

}

export type PaperWingColor = RGBAColor | RGBColor | NormalizeArrayColor | String16bitColor | Number16bitColor

export function isPaperWingColor() {
  
}