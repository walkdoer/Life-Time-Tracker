
/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
var Moment = require('moment');
var extend = require('extend');
var RB = require('react-bootstrap');
var ButtonGroup = RB.ButtonGroup;
var Button = RB.Button;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

/** Utils */
var DataAPI = require('../../utils/DataAPI');

/** components */
var LoadingMask = require('../LoadingMask');
var Bar = require('./Bar');
var TimeColumn = require('./TimeColumn');
var Notify = require('../Notify');

/** constant */
var DATE_FORMAT = 'YYYY-MM-DD';

var ActivityBar = React.createClass({

    mixins: [PureRenderMixin],

    getInitialState: function () {
        return {
            granularity: 'day',
            data: []
        };
    },

    render: function () {
        var granularity = this.state.granularity;
        return (
            <div>
                <ButtonGroup onClick={this.changeActivityGranularity}>
                    {['year', 'month' ,'week', 'day'].map(function (name) {
                        return <Button active={name === granularity}>{name}</Button>
                    })}
                </ButtonGroup>
                <TimeColumn name={this.props.name} data={this.state.data}/>
            </div>
        );
    },

    changeActivityGranularity: function (e) {
        var granularity = e.target.textContent.toLowerCase();
        this.setState({
            granularity: granularity
        }, function () {
            this.loadActivities(this.props.params, this.state.granularity);
        });
    },

    componentDidMount: function () {
        this.loadActivities(this.props.params, this.state.granularity);
    },

    componentWillReceiveProps: function (nextProps) {
        this.loadActivities(nextProps.params, this.state.granularity);
    },

    loadActivities: function (params, granularity) {
        var id;
        var that = this;
        DataAPI.Log.load(extend({
            sum: true,
            group: granularity ? 'date.' + granularity : 'date'
        }, params, this.getDateParams()))
        .then(function (data) {
            data = data.sort(function (a, b) {
                if (granularity === 'week') {
                    var mStart = new Moment(that.props.startDate);
                    var mA = new Moment(mStart.year() + '-W' + (a._id - 1));
                    var mB = new Moment(mStart.year() + '-W' + (b._id - 1));
                    return mA.unix() - mB.unix();
                } else {
                    return new Moment(a._id).unix() - new Moment(b._id).unix();
                }
            }).map(function (item) {
                if (granularity === 'week') {
                    var mStart = new Moment(that.props.startDate);
                    time = new Moment(mStart.year() + '-W' + (item._id-1));
                    return [time.unix() * 1000, item.totalTime];
                } else {
                    return [new Moment(item._id).unix() * 1000, item.totalTime];
                }

            });
            that.setState({
                data: data
            });
        }).catch(function (err) {
            Notify.error('load activity for' + that.props.name +  ' have failed');
            console.error(err.stack);
        });
    },


    getDateParams: function () {
        return {
            start: new Moment(this.props.startDate).format(DATE_FORMAT),
            end: new Moment(this.props.endDate).format(DATE_FORMAT)
        };
    }
});



module.exports = React.createClass({

    mixins: [PureRenderMixin],

    getInitialState: function () {
        return {
            sumData: [],
            selectItem: null,
            loaded: false
        };
    },

    render: function () {
        var barHeight = this.state.sumData.length * 30;
        return (
            <div className="ltt_c-chart ltt_c-chart-activityBar">
                {this.state.selectItem ? <ActivityBar
                    name={this.state.selectItem}
                    params={this.getDetailParams()}
                    startDate={this.props.startDate}
                    endDate={this.props.endDate}/> : null}
                <div style={{height: barHeight}}>
                    <Bar data={this.state.sumData} onPointClick={this.onBarClick}/>
                </div>
                <LoadingMask loaded={this.state.loaded}/>
            </div>
        );
    },

    adaptData: function (data) {
        return (data || []).map(function (item) {
            var id = item._id;
            var name;
            if (id === null) {
                name = '未归类'
            } else if (_.isString(id)){
                name = id;
            } else if (_.isObject(id)) {
                name = id.name;
            }
            return {
                name: name,
                count: item.totalTime
            };
        }).sort(function (a, b) {
            return b.count - a.count;
        });
    },

    componentDidMount: function () {
        this.loadSumData();
    },


    loadSumData: function () {
        var that = this;
        DataAPI.Log.load(extend({
            sum: true
        }, this.getDateParams(), this.props.params))
        .then(function (data) {
            var adaptedData = that.adaptData(data);
            that.setState({
                loaded: true,
                sumData: adaptedData
            });
        })
        .catch(function (err) {
            console.error(err.stack);
        });
    },

    onBarClick: function (value) {
        this.setState({
            selectItem: value.category
        });
        //React.renderComponent(, this.refs.activity.getDOMNode());
    },


    getDateParams: function () {
        return {
            start: new Moment(this.props.startDate).format(DATE_FORMAT),
            end: new Moment(this.props.endDate).format(DATE_FORMAT)
        };
    },

    getDetailParams: function () {
        if (_.isFunction (this.props.detailParams) && this.state.selectItem)  {
            return this.props.detailParams(this.state.selectItem);
        } else {
            return this.props.detailParams;
        }
    },

    componentWillReceiveProps: function () {
        this.loadSumData();
    }

});


