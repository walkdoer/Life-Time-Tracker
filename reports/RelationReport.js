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
var FullDateRangePicker = require('../components/FullDateRangePicker');
var DataAPI = require('../utils/DataAPI');
var Util = require('../utils/Util');
var NodeChart = require('../components/charts/NodeChart');
var d3 = require('d3');


/**charts*/
var RankBar = require('../components/RankBar');


var RelationReport = React.createClass({

    mixins: [PureRenderMixin],

    getInitialState: function () {
        this.__peoples = [];
        return {
            start: new Moment().startOf('month').toDate(),
            end: new Moment().endOf('month').toDate(),
            relationData: null
        };
    },

    render: function () {
        return <div className="ltt_c-report ltt_c-report-RelationReport">
            <h1 className="title"> Relationship </h1>
            <FullDateRangePicker
                    period="month"
                    onDateRangeChange={this.onDateRangeChange}/>
            <RankBar className="chart"
                type="peoples"
                backgroundColor="rgba(255, 255, 255, 0.1)"
                params={{
                    start: this.state.start,
                    end: this.state.end
                }}/>
            {this.state.relationData ? <NodeChart  height={300} data={this.state.relationData}/> : null}
        </div>
    },

    componentWillMount: function () {
        this.loadData();
    },

    onDateRangeChange: function (start, end) {
        this.setState({
            start: start,
            end: end
        }, function () {
            this.loadData();
        });
    },

    loadData: function () {
        DataAPI.People.load().then(function (peoples) {
            this.__peoples = peoples;
            DataAPI.Log.load({
                sum: true,
                start: this.state.start,
                end: this.state.end,
                group: "peoples"
            }).then(function (data) {
                /*[{"_id":"板","totalTime":3319}, ...]*/
                this.setState({
                    relationData: this.buildPeopleRelations(data)
                });
            }.bind(this));
        }.bind(this));
    },

    buildPeopleRelations: function (peopleData) {
        /*
         * 建立起这部分数据格式
         * {"source": 4, "target": 11},
         * {"size": 10, "score": 0.2, "id": "Chenjesu", "type": "circle"},
        */
        var peoples = this.__peoples;
        var data = {}, links= [], nodes = [];
        var size = d3.scale.linear()
                .domain([
                    d3.min(peopleData, function (d) { return d.totalTime; }),
                    d3.max(peopleData, function (d) { return d.totalTime; })
                ])
                .range([20, 200]);
        peopleData.forEach(function (p) {
            var name = p._id;
            var score = p.totalTime;
            nodes.push({
                size: size(p.totalTime),
                score: p.totalTime,
                id: name,
                type: 'circle'
            });
        });

        nodes.forEach(function (node, index) {
            var nodeId = node.id;
            for (var i = 0, len = peoples.length, people; i < len; i++) {
                people = peoples[i];
                if (people._id === nodeId) {
                    (people.relations || []).forEach(function (relation) {
                        var target = getLinkTarget(relation);
                        if (target) {
                            links.push({source: index, target: target})
                        }
                    });
                    break;
                }
            }
        });

        function getLinkTarget(id) {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].id === id) {
                    return i;
                }
            }
        }

        return {
            graph: [],
            links: links,
            nodes: nodes,
            directed: false,
            multigraph: false
        };
    }
});





module.exports = RelationReport;