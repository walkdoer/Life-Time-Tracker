/**
 * 柱状图
 */
'use strict';
var React = require('react');
var R = React.DOM;
var chart = require('./chart');
var convertor = require('../../convertors/column');
var _ = require('underscore');
var Column = React.createClass({
    displayName: 'column',
    render: function() {
        var className = 'ltt_c-chart-column';
        if (this.props.className) {
            className  = [className, this.props.className].join(' ');
        }
        return (
            <div className={className}></div>
        )
    },

    setData: function(data) {
        this.props.data = data;
        if (data) {
            chart.column({
                title: this.props.title,
                $el: $(this.getDOMNode()),
                data: convertor.dispose(data)
            }, {
                xAxis: {
                    categories: this.getCategories(data)
                }
            });
        }
    },

    getCategories: function(data) {
        var categories = [];
        if (_.isArray(data)) {
            _.each(data, function(d) {
                categories.push(d.name || d.label);
            });
        } else if (_.isObject(data)){
            categories = _.keys(data);
        }
        return categories;
    }
});

module.exports = Column;