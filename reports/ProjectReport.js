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

/** components */
var DateRangePicker = require('../components/DateRangePicker');
var ActivityBar = require('../components/charts/ActivityBar');


/** constant */
var DATE_FORMAT = 'YYYY-MM-DD';


module.exports = React.createClass({

    mixins: [PureRenderMixin],

    getInitialState: function () {
        return {
            startDate: new Moment().subtract(1, 'month').toDate(),
            endDate: new Moment().toDate()
        };
    },

    render: function () {
        return (
            <div className="ltt_c-report ltt_c-report-projects">
                <div>
                     <DateRangePicker ref="dateRange" start={this.state.startDate} end={this.state.endDate}
                            onDateRangeChange={this.onDateRangeChange}/>
                </div>
                <ActivityBar
                    params={{group: 'project'}}
                    detailParams={function (selectItem) {
                        return {
                            projects: selectItem
                        };
                    }}
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}/>
            </div>
        );
    },


    onDateRangeChange: function (start, end) {
        this.setState({
            startDate: start,
            endDate: end,
        });
    }

});

