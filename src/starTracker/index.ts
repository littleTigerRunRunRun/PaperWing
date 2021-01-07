import { Shape } from './index'

const templates = []

// 基础数据格式定义：
const AStarTrack = {
  name: '', // 这个不必要
  title: '四方型边框',
  width: 400,
  height: 240,
  items: [
    {
      id: 1,
      // 描述了这段路径的视觉容器（内部的话还需要路径位置展示）
      type: 'rect',
      // 描述了颜色
      fill: { r: 1, g: 1, b: 1, a: 0.4 },
       // 默认的grow和shrink就是0
      h: { grow: 0, shrink: 0, basic: 20 },
      v: { basic: 20 }
    },
    {
      id: 2,
      type: 'rect',
      fill: { r: 1, g: 1, b: 1, a: 0.4 },
      h: { grow: 1, shrink: 1, basic: 0 },
      v: { grow: 1, shrink: 1, basic: 0 }
    },
    {
      id: 3,
      type: 'rect',
      fill: { r: 1, g: 1, b: 1, a: 0.4 },
      // 默认的grow和shrink就是0
      h: { grow: 0, shrink: 0, basic: 20 },
      v: { basic: 20 }
    }
  ],
  squeeze: [
    {
      items: [1, 2, 3],
      direction: 'h'
    }
  ]
}

class StarTrack {
  constructor() {

  }
}