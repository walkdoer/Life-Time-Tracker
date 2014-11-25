/**
 * Bar Chart
 */
var React = require('react');
var chart = require('./chart');
var helper = require('./helper');
var convertor = require('../../convertors/column');
var compareConvertor = require('../../convertors/compareColumn');
var _ = require('underscore');
var Bar = React.createClass({
    displayName: 'bar',
    render: function() {
        var className = 'ltt_c-chart ltt_c-chart-bar';
        if (this.props.className) {
            className  = [className, this.props.className].join(' ');
        }
        return(
            <div className={className}></div>
        );
    },

    setData: function(data) {
        this.props.data = data;
        chart.bar({
            title: this.props.title,
            $el: $(this.getDOMNode()),
            data: convertor.dispose(data)
        }, {
            xAxis: {
                categories: helper.getCategories(data)
            }
        });
    },

    compareData: function (datas){
        chart.bar({
            title: this.props.title,
            $el: $(this.getDOMNode()),
            data: compareConvertor.dispose(datas)
        }, {
            xAxis: {
                categories: helper.getCategoriesForCompareDatas(datas)
            }
        });
    }
});

module.exports = Bar;