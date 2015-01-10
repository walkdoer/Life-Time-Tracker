/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
require('../libs/bootstrap-datepicker');
var remoteStorage = require('../components/storage.remote');
var Moment = require('moment');
var LogEditor = require('../components/editor/LogEditor');
var SearchBox = require('../components/SearchBox');
var Moment = require('moment');
var Notify = require('../components/Notify');

var Ltt = global.Ltt;

var DATE_FORMAT = 'YYYY-MM-DD';


var Page = React.createClass({

    getInitialState: function () {
        return {
            current: new Moment().format(DATE_FORMAT)
        };
    },

    render: function () {
        var days = this.state.days;
        return (
            <div className="ltt_c-page ltt_c-page-logEditor">
                <LogEditor title={this.state.current}
                    onNextDay={this.openNextDay}
                    onPrevDay={this.openPrevDay}
                    ref="logEditor"/>
                <LogDatePicker select={this.state.current}
                    onDateChange={this.onDateChange}
                    ref="datePicker"/>
            </div>
        );
    },

    onDateChange: function (date) {
        console.log('date change');
        date = new Moment(date).format(DATE_FORMAT)
        this.setState({
            current: date
        });
    },

    openPrevDay: function () {
        var prevDay = new Moment(this.state.current).subtract(1, 'day')
        this.setState({
            current: prevDay.format(DATE_FORMAT)
        });
    },

    openNextDay: function () {
        var next = new Moment(this.state.current).add(1, 'day')
        this.setState({
            current: next.format(DATE_FORMAT)
        });
    }
});

var LogDatePicker = React.createClass({
    render: function () {
        return (
            <div className="ltt_c-page-logEditor-datepicker"></div>
        );
    },

    setDate: function (date) {
        $(this.getDOMNode()).datepicker('setDate', this.props.select);
    },

    componentDidMount: function () {
        var onDateChange = this.props.onDateChange;
        $(this.getDOMNode())
        .datepicker({
            todayHighlight: true,
            format: "yyyy-mm-dd",
            calendarWeeks: true
        })
        .on('changeDate', function (e) {
            var date = e.date;
            onDateChange(date);
        }).datepicker('setDate', this.props.select, false);
    },

    componentDidUpdate: function () {
        console.log('update');
        $(this.getDOMNode()).datepicker('setDate', this.props.select, false);
    }
});


var FilterableList = React.createClass({

    getDefaultProps: function () {
        return {
            items: []
        };
    },
    render: function () {
        var select = this.props.select;
        var items = this.props.items;
        return (
            <div className="ltt_c-filterableList">
                <SearchBox placeholder="search here"/>
                <div className="ltt_c-filterableList-list scrollable">
                {items.map(function (item) {
                    var selected = item.key === select;
                    return (<ListItem {...item} selected={selected} onClick={this.props.onItemClick}/>)
                }, this)}
                </div>
            </div>
        );
    }
});

var ListItem = React.createClass({
    render: function () {
        var className = "ltt_c-filterableList-list-item";
        if (this.props.selected) {
            className = className + ' selected';
        }
        return (
            <div className={className} onClick={this.onClick}>
                <div className="ltt_c-filterableList-list-item-name">{this.props.name}</div>
            </div>
        );
    },

    onClick: function (e) {
        this.props.onClick(e, this.props);
    }
})


module.exports = Page;
