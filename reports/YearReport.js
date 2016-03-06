/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ReactBootStrap = require('react-bootstrap');
var numeral = require('numeral');

var LoadingMask = require('../components/LoadingMask');
var DataAPI = require('../utils/DataAPI');
var Util = require('../utils/Util');


/**charts*/
var WordsCloud = require('../components/charts/WordsCloud');
var LogClassPie = require('../components/LogClassPie');
var RankBar = require('../components/RankBar');


var WakeAndSleep = require('../components/WakeAndSleep');
var Calculator = require('../components/Calculator');


var YearReport = React.createClass({

    getInitialState: function () {
        return {
            year: new Moment().subtract(1, 'year').year()
        };
    },

    render: function () {
        var year = this.state.year;
        var startOfYear = new Moment().year(year).startOf('year'),
            endOfYear = new Moment().year(year).endOf('year');
        return (
            <div className="ltt_c-report ltt_c-report-YearReport">
                <h1 className="title">{year}年度报告</h1>
                <h2> 基本生活数据 </h2>
                <WakeAndSleep start={startOfYear} end={endOfYear}/>
                <h4>各个类别的时间比例</h4>
                <div className="Grid Grid--gutters Grid--stretch">
                    <div className="Grid-cell u-1of2">
                        <LogClassPie type="classes"
                        title="时间分类饼图"
                        backgroundColor="rgba(255, 255, 255, 0.1)"
                        start={startOfYear}
                        end={endOfYear}
                        compare={false}
                        legend={true}/>
                    </div>
                    <div className="Grid-cell u-1of2">
                        <RankBar className="chart"
                            type="classes"
                            backgroundColor="rgba(255, 255, 255, 0.1)"
                            params={{
                                start: startOfYear.toDate(),
                                end: endOfYear.toDate()
                            }}/>
                    </div>
                </div>
                <h4>Tag标签图</h4>
                <YearTag year={year}/>
                <h5>Tag 前30强</h5>
                <RankBar className="chart"
                    type="tags"
                    backgroundColor="rgba(255, 255, 255, 0.1)"
                    params={{
                        start: startOfYear.toDate(),
                        end: endOfYear.toDate(),
                        limit: 30
                    }}/>
                <h4>投入时间最多的20个项目</h4>
                <RankBar className="chart"
                    type="project"
                    backgroundColor="rgba(255, 255, 255, 0.1)"
                    params={{
                        start: startOfYear.toDate(),
                        end: endOfYear.toDate(),
                        limit: 20
                    }}/>

                <h2> 人际关系 </h2>
                <pre>通过时间的维度来展示{year}这一年我与其他人的关系</pre>
                <RankBar className="chart"
                    type="peoples"
                    backgroundColor="rgba(255, 255, 255, 0.1)"
                    params={{
                        start: startOfYear.toDate(),
                        end: endOfYear.toDate(),
                    }}/>
                <div className="achievement">
                <h2> 成就 </h2>
                    <div>一共得到了<Calculator type="log.count"
                            params={{tags: '启发', start: startOfYear, end: endOfYear}}/>次启发，点击查看那些启发</div>
                    <div>读了 <Calculator type="task.count"
                        params={{tags: 'rb', status: 'done', start: startOfYear, end: endOfYear, populate: false}}/>本书， 一共花了
                        <Calculator type="log.time"
                            params={{tags: 'rb', start: startOfYear, end: endOfYear}}/>
                        个小时</div>
                    <div></div>
                    <div>看了<Calculator type="task.count"
                            params={{start: startOfYear, end: endOfYear, projects: "OTD"}}/>个TED视频，花了 <Calculator type="log.time"
                            params={{projects: "OTD", start: startOfYear, end: endOfYear}}/>个小时</div>
                    <div>运动花了多少时间，其中健身，跑步花了多少，热力图，还有其他那些类型的运动</div>
                    <div>花了多少时间编程，bugfix时间占比</div>
                    <div>创建了 1000 个task， 完成了800个</div>
                </div>
                <h2> 娱乐 </h2>
                <pre> 看电视花了，看美剧用了看了100部电影, 其中有 4部是纪录片，认为是好电影的有10部, 一共花了100个小时。</pre>
                <h2> 情感生活 </h2>
                <pre> 花了多少时间在家人上 ， 时间的热力图, 花了多少时间在恋爱, 时间的热力图 花了多少时间在朋友聚会</pre>
            </div>
        );
    }
});


var YearTag = React.createClass({

    getInitialState: function () {
        return {
            tags: [],
            loaded: false
        };
    },

    render: function () {
        return <div className="tag-cloud">
            <WordsCloud words={this.adaptData(this.state.tags)}/>
            <LoadingMask loaded={this.state.loaded}/>
        </div>
    },

    componentDidMount: function () {
        this.loadTagData();
    },

    adaptData: function (tags) {
        return (tags || []).map(function (tag) {
            return {
                text: tag.label,
                size: tag.count
            };
        })
    },

    loadTagData: function () {
        var that = this;
        DataAPI.Stat.load({
            start: new Moment().year(this.props.year).startOf('year').format(Util.DATE_FORMAT),
            end: new Moment().year(this.props.year).endOf('year').format(Util.DATE_FORMAT)
        })
        .then(function (data) {
            that.setState({
                loaded: true,
                tags: data.tagTime
            });
        })
        .catch(function (err) {
            console.error(err.stack);
        });
    }
});



module.exports = YearReport;