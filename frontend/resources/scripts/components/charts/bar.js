/**
 * Bar图
 */
define(function(require) {
    'use strict';
    var React = require('react');
    var R = React.DOM;
    var chart = require('./chart');
    var convertor = require('app/components/convertors/column');
    var _ = require('underscore');
    var Bar = React.createClass({
        displayName: 'bar',
        render: function() {
            var className = 'ltt_c-chart-bar';
            if (this.props.className) {
                className  = [className, this.props.className].join(' ');
            }
            return R.div({
                className: className
            });
        },

        setData: function(data) {
            this.props.data = data;
            if (data) {
                chart.bar({
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

    return Bar;
});