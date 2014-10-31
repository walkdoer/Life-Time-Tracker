define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var remoteStorage = require('../../storage.remote');
    var Pie = require('../../charts/pie');
    var Column = require('../../charts/column');
    var Moment = require('moment');
    var col4 = 'col-xs-6 col-md-4',
        col8 = 'col-xs-12 col-md-8',
        col3 = 'col-xs-6 col-md-3';

    var DayReport = React.createClass({
        displayName: 'dayReport',

        render: function() {
            var layout = [
                R.div({className: 'row'}, [
                    Pie({className: col4, ref: 'logClassTime'}),
                    Column({title: '标签时间', className: col8, ref: 'tagTime'})
                ])
            ];
            return R.div({className: 'ltt_c-report'}, layout);
        },

        componentDidMount: function () {
            var that = this;
            var url = this.getUrl();
            remoteStorage.get(url)
                .then(function (result) {
                    console.log(result);
                    that.refs.logClassTime.setData(result.data.classTime);
                    that.refs.tagTime.setData(result.data.tagTime);
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