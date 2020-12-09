// 纸翼使用时的伪代码
// 由于会涉及四层结构的包装，纸翼将会异常的复杂，为了模拟它而达成更好的开发体验，我们尝试分别从第二层的api和第三层的api构建同一个东西

// 数据
const config = {
  width: 400,
  height: 280,
  center: ['50%', '50%'],
  radius: '20%', // 数值可以填入三种模式： Number是绝对数字，PercentString是相对尺寸,CountingExpressString是计算表达式（可以是相对+绝对）
  data: [10, 20, 50, 80, 10],
  color: ['#ff0', '#e9f', '#9f8']
}

// Layer1: PaperWing
class Scene {
  constructor({ width, height }) {
    
  }
}

function dealPieData(data, color) {
  return [
    {
      position: [],
      startAngle: 0, // startAngle
      endAngle: 0,
      radius: 0,
      color
    }
  ]
}

// Layer2: PaperShape
// 使用第二层的api 构建一个饼图
class FanShape {
  constructor() {

  }
}

const scene = new Scene({ width: config.width, height: config.height })

const fans = dealPieData(config.data, config.color)
fans.map((fan) => new FanShape(fan))

// layer3: PaperChart
//