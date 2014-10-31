define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var remoteStorage = require('../../storage.remote');
    var Pie = require('../../charts/pie');
    var Column = require('../../charts/column');
    var Bar = require('../../charts/bar');
    var Moment = require('moment');
    var LogList = require('../../logList');
    var LoadIndicator = require('app/components/loadIndicator');
    var col4 = 'col-xs-6 col-md-4',
        col8 = 'col-xs-12 col-md-8',
        col3 = 'col-xs-6 col-md-3';

    var DayReport = React.createClass({
        displayName: 'dayReport',

        getInitialState: function () {
            return {
                loading: true,
                logs: [],

            };
        },

        render: function() {
            var layout = [
                LoadIndicator({active: this.state.loading}),
                R.div({className: 'row'}, [
                    Pie({className: col4, ref: 'logClassTime', data: this.state.classTime}),
                    Column({title: '标签时间', className: col8, ref: 'tagTime', data: this.state.tagTime})
                ]),
                R.div({className: 'row'}, [
                    Bar({className: col4, ref: 'projectTime', data: this.state.projectTime}),
                    Bar({className: col4, ref: 'categoryTime', data: this.state.categoryTime})
                ]),
                R.div({className: 'row'}, LogList({ref: 'logList'}))
            ];
            return R.div({className: 'ltt_c-report'}, layout);
        },

        componentDidMount: function () {
            var that = this;
            var url = this.getUrl();
            remoteStorage.get(url)
                .then(function (result) {
                    var statData = result.data;
                    console.log(result);
                    that.refs.logClassTime.setData(statData.classTime);
                    that.refs.tagTime.setData(statData.tagTime);
                    that.refs.categoryTime.setData(statData.categoryPerspective.categoryTime);
                    that.refs.projectTime.setData(statData.projectTime);
                });
        },

        getUrl: function () {
            var date = this.props.date;
            if (date) {
                return '/api/stats/' + (new Moment(date).format('YYYY/MM/DD'));
            }
        }



    });

    return DayReport;
});