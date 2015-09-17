Life Time Tracker
=====================


### 这个软件有什么用？

Life Time Tracker是一个做个人时间统计的工具，读了《奇特的一生》之后，想实践柳比歇夫的统计方法。但是没有找到就手的工具，所以决定自己开发一个，顺便尝试一下`nwjs + react`的组合来开发桌面App，同时也实践近一段时间在学习的数据可视化。

现在文档较少，请多包涵。

### 安装

暂时不提供App的下载, 需要的请自行clone项目，然后进行构建生成软件 `目前只支持 osx`, 后面有时间再计划支持主要的平台

#### 安装前请确定你有下列依赖

- node
- gulp
- bower
- mongodb >= 3.0.0

#### 生成App

######1.先安装依赖

```
npm install
bower install
```

######2. 构建

```
gulp deploy
#默认使用最新版本的nw.js
gulp nw
#如果最新版本的使用不了，可以指定版本号进行构建
gulp nw --version 0.12.3
```

就这样子完成了，然后会在 productions目录下生成app文件


### 使用

采用文本日志的形式来记录时间，对时间进行多维度的描述,尽可能的还原这段时间的真相，为后面的统计积累数据。

采用纯文本的日志记录是因为，效率和方便分析与存储

在介绍概念之前，请看一个例子，这里模拟一天的日志，请看看你能否看懂。看不懂没关系，看到后面的概念介绍你就会明白的。

```
8:45
8:45~9:06 {NT}[修身]
9:06~9:27 {NT}[交通]
9:27~9:40 {NT}[早餐]
10:01~10:40 {WK}[文档]<SuperAI>(编写API文档:pg=30 link="http://某个链接地址")  这是一些注释，pg表示进度，link表示连接地址
10:40~11:26 {WK}[问题排查]<Circle>$0.1.0$(排查无法上传文档的问题) 可能是Content-type问题
11:40~11:52 {WK} 处理一些工作琐事
12:16~12:46 {NT}[lunch] 午餐的时候和@(杰子)聊天，好搞笑
12:47~12:57 {STU}[生物]<每天一个TED>(走进蜜蜂生命中的最初21天)
12:58~13:16 {STU}[启发,社会]<每天一个TED>(怎样复苏一个社区：用想象力、美和艺术) 如何从无到有去创造一样东西
13:17~13:39 {BRK}[午休]
14:33~14:38 {WK}[编程,优化]<life-time-tracker>$0.1.11$(未完成高亮优化) 当修改的时候一并进行移动
14:38~16:52 {WK}[编程,优化]<life-time-tracker>$0.1.11$(高亮日志功能:pg=100) starlog ,用于star行，提高可读性，这个功能算是完成了
17:04~17:18 {SPR}[散步]
17:28~18:02 {WK}[开发工具]<DED>$1.3.5$(添加Grunt-gzip到generator-act中)
18:02~18:52 {WK}[问题排查]<DED>$1.3.5$(Nginx 499问题排查) have no clue
19:16~19:40 {NT}[supper]
19:40~20:18 {WK}[问题排查]<DED>$1.3.5$(Nginx 499问题排查) 可能是中间加速设备，但是无法追踪
21:00~23:10 {WK}[预研]<Circle>$0.1.0$(设计一个信息采集器:pg=10) scrapy抓取知乎
23:12~23:35 {NT}[交通]
23:35~00:28 {BRK}[听音乐]
00:40~1:30 {ENT}[tv,美剧]<冰血暴>$第一季$(1)
1:30
```

#### 日志格式

其中涉及到几个分类的方式

##### 类别

用 `{}` 来表示, 例如 `{休息}`, `{工作}` ，为了更加快速的输入，可以选择英文，例如 `{work}`, `{study}`, 为了更快的输入，甚至可以用缩写，例如 `{wk}` 表示工作 ，`{stu}`表示学习，等等。可以任意定义

##### 标签

用 `[]` 来表示, 可以有多个标签, 用于描述这一段时间。 例如 `[读书,历史,人类历史]`

```
10:00~11:00 {STU}[技术漫游,github, 阅读代码] 查看一下Github Trending, 阅读感兴趣项目的代码
```

##### 项目， 版本， 任务， 子任务

项目，版本，任务，子任务，其实是对生活的进一步一个细分，方便记录复杂的生活场景，如工作中的项目，个人的研究。

- **项目** `<>`  生活中的许多方面都可以用项目来归类，用一些好玩的名字来归类自己的生活也挺有趣。
- **版本** `$$` 例如看美剧的时候可以记录为 `22:00~23:00 [tv,美剧]<纸牌屋>$第一季$(1)`
- **任务** `()` 有需要可以用于进一步的细分
- **子任务** `##`  有需要可以用于进一步的细分

例如

```
9:00~10:00 {STU}[读书,历史]<格物致知>$世界通史$(第一章)
10:30~12:30 {WK}[编程]<我的个人项目>$0.1.0$(初始化项目)
```

##### 注明

结合云端存储使用，风味更佳。例如Dropbox，可以保持日志的版本，这样可以解决日志的安全和同步等问题。


### 开发

基于 nw.js + react.js + bootstrap 的组合进行开发，还有多个开源组件
- highcharts.js
- d3.js
- 更多依赖可以查看package.json和bower.json中的依赖申明

clone项目之后，运行 `npm install` 和 `bower install` 安装依赖;
然后运行 `gulp`, 和 打开开发服务器`node node_modules/tracker/ltt.js server`之后可以进行开发了，在浏览器中打开也可以，默认访问`localhost:3000` 但是会失去部分nw.js提供的功能.



### Screenshot


Dashboard

![Dashboard](https://raw.githubusercontent.com/zhangmhao/Life-Time-Tracker/master/images/screenshots/dashboard-v0.1.11.png)

日志编辑器，提供快捷键提高编辑效率

![log editor](https://raw.githubusercontent.com/zhangmhao/Life-Time-Tracker/master/images/screenshots/editor.png)

个人数据可视化

这里列出的只是其中一份报表，还有更多类型的报表。

![个人数据可视化](https://raw.githubusercontent.com/zhangmhao/Life-Time-Tracker/master/images/screenshots/report-v0.1.11.png)

项目可视化

![项目界面](https://raw.githubusercontent.com/zhangmhao/Life-Time-Tracker/master/images/screenshots/projects.png)

![项目，报表，task的管理界面](https://raw.githubusercontent.com/zhangmhao/Life-Time-Tracker/master/images/screenshots/project.task.png)


搜索

![搜索](https://raw.githubusercontent.com/zhangmhao/Life-Time-Tracker/master/images/screenshots/search.png)

目标管理

![goal](https://raw.githubusercontent.com/zhangmhao/Life-Time-Tracker/master/images/screenshots/goal.png)

### 最后

在生活中学到一些新的东西，如果有办法融入到软件里面的，就会进行开发，这个时候真的觉得写软件，就像是写书一样。

### License

Creative Commons Attribution-NonCommercial 3.0 License.


-------------------------------------
感谢 亚历山大·亚历山德罗维奇·柳比歇夫