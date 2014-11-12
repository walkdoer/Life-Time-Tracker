/**
 * Bar Chart
 */
var React = require('react');
var chart = require('./chart');
var convertor = require('../../convertors/column');
var _ = require('underscore');
var Bar = React.createClass({
    displayName: 'bar',
    render: function() {
        var className = 'ltt_c-chart-bar';
        if (this.props.className) {
            className  = [className, this.props.className].join(' ');
        }
        return(
            <div className={className}></div>
        );
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

module.exports = Bar;