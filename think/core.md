# 不同包装层次的设计
既可以像echarts一样，以固定好的架构使用，也可以像编程式开发，调用api操作

# 内容的树状结构
(bound处理)
Scene - Group - Shape
              - Particle
      - Shape
      - Particle

Shape = Geometry(计算顶点、描边等) + Material(材质)