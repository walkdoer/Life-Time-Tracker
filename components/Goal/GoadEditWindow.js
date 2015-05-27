/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
var Moment = require('moment');
var ReactBootStrap = require('react-bootstrap');
var Button = ReactBootStrap.Button;
var Modal = ReactBootStrap.Modal;
var ModalTrigger = ReactBootStrap.ModalTrigger;
var Input = ReactBootStrap.Input;
var ReactPropTypes = React.PropTypes;
var numeral = require('numeral');
var cx = require('react/lib/cx');
var _ = require('lodash');
var extend = require('extend');

/** Components */
var TimeInput = require('../../components/TimeInput');

/** Constant */
var EMPTY_FUN = function () {};


module.exports = React.createClass({

    getDefaultProps: function () {
        return {
            onSave: EMPTY_FUN
        };
    },

    getInitialState: function () {
        var goal = this.props.goal;
        return extend({}, goal);
    },

    render: function() {
        var that = this;
        var goal = this.props.goal;
        var title = (goal ? 'Edit' : 'Create') + ' Goal';
        return (
            <Modal {...this.props} bsStyle="primary" title={title} animation={true}>
                <div className="modal-body">
                    <Input type='text' label='Name' placeholder='Enter text' value={this.state.name} onChange={this.onNameChange} ref="name"/>
                    <TimeInput type='text' label='EstimatedTime' placeholder='any time you want'
                        value={this.state.estimatedTime}
                        onChange={this.onEstimatedTimeChange}/>
                    {this.renderGranularity()}
                    <pre id="ltt_c-CreateAddGoalModal-filterEditor" className="ltt_c-CreateAddGoalModal-filterEditor"/>
                    <div className="help-block">
                        Use filter to filter the log for the goal
                        <pre>
                                "classes": "SPR",
                                "tags": 'running,jogging',
                                "projects": "...",
                                "tasks": "..."
                        </pre>
                    </div>
                </div>
                <div className="modal-footer">
                    <Button onClick={this.props.onRequestHide}>Close</Button>
                    <Button bsStyle="primary" onClick={this._onSave}>Save</Button>
                </div>
            </Modal>
        );
    },

    renderGranularity: function () {
        var that = this;
        var granularity = this.state.granularity;
        return (
            <div className="btn-group">
                {[
                    {label: 'Day', value: 'day'},
                    {label: 'Week', value: 'week'},
                    {label: 'Month', value: 'month'},
                    {label: 'Year', value: 'year'},
                ].map(function (btn) {
                    var className = "btn btn-xs btn-default";
                    if (btn.value === granularity) {
                        className += ' active';
                    }
                    return <button className={className}
                        onClick={that.onGranularityChange.bind(that, btn.value)}>{btn.label}</button>;
                })}
            </div>
        );
    },

    onGranularityChange: function (value) {
        this.setState({
            granularity: value
        });
    },

    initEditor: function () {
        var goal = this.props.goal;
        var that = this;
        var editor = ace.edit('ltt_c-CreateAddGoalModal-filterEditor');
        this.editor = editor;
        editor.setTheme("ace/theme/github");
        editor.renderer.setShowGutter(false); //hide the linenumbers
        var session = editor.getSession();
        session.setMode("ace/mode/json");
        session.setUseWrapMode(true);
        editor.setOptions({
            enableSnippets: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false
        });
        if (goal) {
            editor.setValue(goal.filter, -1);
        }
        session.on('change', _.debounce(function (e) {
            var content = session.getValue();
            content = content.trim();
            var data = {
                filter: content,
                filterParseSuccess: that._isFilterValid(content)
            };
            that.setState(data);
        }, 200));
    },

    getGoal: function () {
        if (this.state.filterParseSuccess === false) {
            return null;
        }
        return this.state;
    },

    _isFilterValid: function (filterStr) {
        try {
            JSON.parse(filterStr);
            return true;
        } catch (e) {
            return false;
        }
    },

    onNameChange: function () {
        this.setState({
            name: this.refs.name.getValue()
        });
    },

    onEstimatedTimeChange: function (time) {
        this.setState({
            estimatedTime: time
        });
    },

    _onSave: function () {
        var goal = this.getGoal();
        if (goal) {
            this.props.onSave(goal);
        }
    },

    componentDidMount: function () {
        this.initEditor();
    }
});