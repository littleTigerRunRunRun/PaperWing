// 抽象类和mixin使用时有一些区别，由于mixin只能混入原型链上的东西，所以如果需要默认赋值，就无法混入，只能继承
export { Treelike, Leaflike } from './TreeAndLeaf'