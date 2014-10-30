define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var remoteStorage = require('../../storage.remote');
    var Pie = require('../../charts/pie');
    var Moment = require('moment');

    var DayReport = React.createClass({
        displayName: 'dayReport',

        render: function() {
            var layout = [
                R.div({className: 'row'})
            ];
            return R.div({className: 'ltt_c-report'}, layout);
        },

        componentDidMount: function () {
            var that = this;
            var url = this.getUrl();
            remoteStorage.get(url)
                .then(function (result) {
                    console.log(result);
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