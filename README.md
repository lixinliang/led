# Create a canvas like a led pannel

> *led* 基于支持Canvas API的浏览器

### <a name="top"></a>目录
* [简介(Intro)](#intro)
* [示例(Demo)](#demo)
* [使用方法(Usage)](#usage)
* [参数列表(Config)](#config)
* [方法列表(API)](#api)
* [回调函数(Callback)](#callback)
* [已知问题(Issues)](#known-issues)
* [License](#license)

### <a name="intro"></a>简介(Intro) [[⬆]](#top)
使用&lt;canvas&gt;实现文字粒子效果，除了允许输入字符还允许输入特定命令。
感谢[shape-shifter]的帮助。

This canvas plugin is base on [shape-shifter]. Appreciate for its help.

### <a name="demo"></a>示例(Demo) [[⬆]](#top)
[Demo]

### <a name="usage"></a>使用方法(Usage) [[⬆]](#top)
[How to use]

### <a name="config"></a>参数列表(Config) [[⬆]](#top)
|   参数(args)    |     说明(desc)     |          默认值(default)         | 可填值(allowed) |
|----------------|--------------------|---------------------------------|----------------|
| content        | 画布               | '[data-role=led-content]'        | selector      |
| width          | 画布宽度            | window.innerWidth               | Number        |
| height         | 画布高度            | window.innerHeight              | Number        |
| split          | 命令句分隔符         | '&brvbar;'  (&amp;brvbar;)     | String        |
| command        | 命令标识符          | '#'                             | String        |
| partition      | 命令参数标识符       | ' ' (&amp;nbsp;)                | String         |
| error          | 语法错误时默认命令    | 'What?'                         | String         |
| action         | 创建对象时默认命令    | 'hello'                         | String         |
| keyword        | url上匹配命令的关键词 | 'led'                           | String         |
| minCount       | 最小数数值           | 1                              | Number         |
| maxCount       | 最大数数值           | 10                             | Number         |
| maxShapeSize   | 形状最大参数         | 30                             | Number         |
| rectangleWidth | 矩形默认宽度         | 30                             | Number         |
| rectangleHeight| 矩形默认高度         | 15                             | Number         |
| circleRadius   | 圆形默认半径         | 18                             | Number         |
| formatTime     | 日期对象转字符串函数  | anonymous function(){ ... }     | Function      |
| imgUrl         | 图标路径            | 'img/icon/'                    | String         |
| imgType        | 图标格式            | '.png'                          | String         |
| speed          | 普通命令间隔时间      | 2000                            | Number         |
| countSpeed     | 数数命令间隔时间      | 1000                            | Number         |
| timeSpeed      | 时间命令间隔时间      | 1000                            | Number         |
| gap            | 圆点间距            | 13                               | Number         |
| fontSize       | 文字大小            | 1000                             | Number         |
| fontFamily     | 文字字体            | 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif'| String |
| pointRadius    | 圆点大小            | 5                                | Number     |
| pointColor     | 圆点颜色            | { r : 255, g : 102, b : 51, a : 0.3 }| Object     |
| shapeOpactiy   | 组成形状时的圆点透明度| 0.9                              | Number         |
| shiver         | 文字是否抖动        | true                              | Boolean         |
| diffuse        | 散开的圆点是否随机悬浮 | true                            | Boolean         |


### <a name="api"></a>方法列表(API) [[⬆]](#top)
| 方法(API) | 说明(desc)  | 参数(args) |
|----------|-------------|-----------|
| init     | 创建对象     | null |
| render   | 重绘画图     | width(\*Number), height(\*Number) |
| simulate | 模拟        | action(\*String|Number|Array) |
| reset    | 撤销命令     | null |
| clear    | 清除画布     | null |
| stop     | 暂停动画     | null |
| start    | 开始动画     | null |
| destroy  | 销毁对象     | null |
| shuffle  | 打乱一下     | null |
| on       | 事件委托     | event(\*String), callback(\*Function) |
| off      | 撤销事件委托  | event(\*String), callback(\*Function) |
| trigger  | 触发事件     | event(\*String), callback(\*Function), args |


### <a name="callback"></a>回调函数(Callback) [[⬆]](#top)
| 回调函数(callback) |              说明(desc)              			| 参数(args) |
|-------------------|-----------------------------------------------|-----------|
| init   	     	| 创建对象成功时触发。                             | null      |
| action    		| 执行命令时触发。                            	| command(Object) |
| shuffle   	    | 打乱成功时触发。                             | null      |

### <a name="known-issues"></a>已知问题(Issues) [[⬆]](#top)

### <a name="license"></a>License [[⬆]](#top)
Released under [MIT] LICENSE

---
[shape-shifter]: https://github.com/kennethcachia/shape-shifter
[Demo]: http://lixinliang.github.io/led/tests/index.html
[How to use]: http://lixinliang.github.io/led/examples/index.html
[MIT]: http://rem.mit-license.org/