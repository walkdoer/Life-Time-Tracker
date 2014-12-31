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
var Ltt = global.Ltt;
var Notify = require('../components/Notify');


var DATE_FORMAT = 'YYYY-MM-DD';


var Page = React.createClass({

    getInitialState: function () {
        var days = [];
        var start = new Moment().startOf('month');
        var end = new Moment().endOf('month');
        while(start.diff(end) <= 0) {
            days.push(Moment(start).toDate());
            start.add(1, 'day');
        }
        days.reverse();
        return {
            days: days,
            current: new Moment().format(DATE_FORMAT)
        };
    },

    render: function () {
        var days = this.state.days;
        days = days.map(function (day) {
            var name = new Moment(day).format(DATE_FORMAT);
            return {
                name: name,
                key: name
            };
        });
        return (
            <div className="ltt_c-page ltt_c-page-logEditor">
                <FilterableList items={days} select={this.state.current}/>
                <LogEditor onImport={this.onImport}/>
            </div>
        );
    },

    onImport: function (content) {
        Ltt.sdk.importLogContent(this.state.current, content).then(function () {
            Notify.success('Import success', {timeout: 1500});
        }).catch(function () {
            Notify.error('Import failed', {timeout: 3500});
        });
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
                <div className="ltt_c-filterableList-list">
                {items.map(function (item) {
                    var selected = item.key === select;
                    return (<ListItem {...item} selected={selected}/>)
                })}
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
            <div className={className}>
                <div className="ltt_c-filterableList-list-item-name">{this.props.name}</div>
            </div>
        );
    }
})


module.exports = Page;
