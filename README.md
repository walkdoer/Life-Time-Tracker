Life Time Tracker
=====================

### 界面

Dashboard:

[!Dashboard](https://raw.githubusercontent.com/zhangmhao/Life-Time-Tracker/master/images/screenshots/dashboard.png)

Log Editor:

[!Log Editor](https://raw.githubusercontent.com/zhangmhao/Life-Time-Tracker/master/images/screenshots/log_editor.png)

Report

[!Report](https://raw.githubusercontent.com/zhangmhao/Life-Time-Tracker/master/images/screenshots/report.png)

Project

[!Project](https://raw.githubusercontent.com/zhangmhao/Life-Time-Tracker/master/images/screenshots/project.png)

### 时间记录方式

个人时间记录，每日记录一次。用于每周每月时间统计。

### 时间分类

时间分为两个等级：第一类时间，第二类时间；第一类时间基本为创造性的生产性工作；第二类为消费性质的时间；

#### 第一类时间(FCT)

比较有创造性的事情，例如工作，学习，运动

**大脑:** 编程，阅读（非娱乐性小说类），创意思考，听讲座
**身体:** 健身，跑步，骑车
**乐器:** 吉他

#### 第二类时间(SCT)

创造性较低，基本是消费性质。

娱乐：听音乐，看电影，看话剧，看小说，购物

### 规则

1. 只记录有价值的时间（初期会记录吃饭，洗澡，等琐事时间，方便改进，一旦稳定下来则取消记录此类时间）
2. 每日对时间进行统计
3. 每周对时间进行统计
4. 每月对时间进行统计
5. 每年对时间进行统计


### 事物分类Class

- 一般事物 `NT`
- 工作 `WK`
- 娱乐 `ET`
- 学习 `STU`
- 运动 `SPR`
- 思考 `TK`
- 休息 `BRK`

### 标签Tag

Tag和Class在一起，一起描述一段时间的属性和用途；实际例如：

```
10:00~11:00 {LN}[computer,读书]<深入理解计算机系统>
11:00~11:30 {ET}[听音乐]
11:30~12:30 {Wk}[编程] <XXX项目> 编写第一个版本
13:00~15:30 {ET}[看电影] <曼哈顿计划>
15:30~16:00 {NT}[交通,bus] 坐公交车回家,一路昏昏沉沉
16:00~16:30 {BRK}[睡觉] 太累了，睡个觉休息一下
```
具体的标签参见文件`./tags.json`,会随着生活的变化更新标签文件





阅读分为：书籍, 时事, 杂志, 论文, 短文 5个大类，其中由于`书籍`种类繁多，所以可以继续细分

- 书籍: `人文`, `历史`, `生活`, `理工`

详细参见文件 `./meta/bookClassification.json`



### 目录结构

每年建立一个文件夹;每个月记录一个文件;文件通过Git进行管理，为了保证数据的安全性，同步到Git远程服务器和同步到DropBox中。


```
├── 2014
│   └── 2014-07.time
│   └── 2014-08.time
│   └── 2014-09.time
│   └── 2014-10.time
│   └── 2014-11.time
│   └── 2014-12.time
├── 2015
│   └── 2015-01.time
│   └── 2015-02.time
│   └── 2015-03.time
```

### 文件记录模板

详细参见文件 template.md

-------------------------------------
感谢 亚历山大·亚历山德罗维奇·柳比歇夫
