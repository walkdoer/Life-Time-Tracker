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
        return {
            current: new Moment().format(DATE_FORMAT)
        };
    },

    render: function () {
        var days = this.state.days;
        return (
            <div className="ltt_c-page ltt_c-page-logEditor">
                <LogEditor title={this.state.current}
                    onImport={this.onImport}
                    onLoad={this.onEditorLoad}
                    ref="logEditor"/>
                <LogDatePicker select={this.state.current}
                    onDateChange={function (date) {
                        this.openLog(new Moment(date).format(DATE_FORMAT));
                    }.bind(this)}/>
            </div>
        );
    },

    onImport: function (content) {
        var date = this.state.current;
        Ltt.sdk.writeLogFile(date, content).then(function () {
            Ltt.sdk.importLogContent(date, content).then(function () {
                Notify.success('Save and Import success', {timeout: 1500});
            }).catch(function () {
                Notify.error('Import failed', {timeout: 3500});
            });
        }).catch(function (err) {
            Notify.error('Save failed ', {timeout: 3500});
        });
    },

    onEditorLoad: function () {
        this.openLog(this.state.current);
    },

    openLog: function (date) {
        this.setState({
            current: date
        });
        var editor = this.refs.logEditor;
        if (!Ltt) { return; }
        Ltt.sdk.readLogContent(date)
            .then(function (content) {
                editor.setValue(content);
            })
            .catch(function (err) {
                Notify.error('Open log content failed', {timeout: 3500});
            });
    }
});

var LogDatePicker = React.createClass({
    render: function () {
        return (
            <div className="ltt_c-page-logEditor-datepicker"></div>
        );
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
        }).datepicker('setDate', this.props.select);
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
