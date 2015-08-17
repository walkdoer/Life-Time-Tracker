Life Time Tracker
=====================

Life Time Tracker是一个做个人时间统计的工具，读了《奇特的一生》之后，想实践柳比歇夫的统计方法，第一个想法就是必须得通过计算机来自动化；但是没有找到合适自己使用的工具，决定自己开发一个，顺便尝试一下`nwjs + react`的组合来开发桌面App


### 安装

暂时不提供App的下载, 需要的请自行下载项目，然后进行构建生成软件 `目前只支持 osx`

#### 安装前请确定你有下列依赖

- node
- gulp
- bower
- mongodb

#### 生成App所需要执行的命令

######1.先安装依赖

```
npm install
bower install
```
######2. 构建

```
gulp deploy
gulp nw
```

然后会在 productions目录下生成app文件

### 开发

基于 nw.js + react.js + bootstrap 的组合进行开发，还有多个开源组件
- highcharts.js
- d3.js
- 更多依赖可以查看package.json和bower.json中的依赖申明

clone项目之后，运行 `npm install` 和 `bower install` 安装依赖;
然后运行 `gulp`, 和 打开开发服务器`node node_modules/tracker/ltt.js server`之后可以进行开发了，在浏览器中打开也可以，默认访问`localhost:3000` 但是会失去部分nw.js提供的功能.

-------------------------------------
感谢 亚历山大·亚历山德罗维奇·柳比歇夫
