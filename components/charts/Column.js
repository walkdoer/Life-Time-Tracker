/**
 * 柱状图
 */
'use strict';
var React = require('react');
var R = React.DOM;
var chart = require('./chart');
var helper = require('./helper');
var convertor = require('../../convertors/column');
var compareConvertor = require('../../convertors/compareColumn');
var _ = require('lodash');
var CommonFunction = require('./CommonFunction');
var Column = React.createClass({
    displayName: 'column',
    mixins: [ CommonFunction ],
    getDefaultProps: function () {
        return {
            dataLabels: true
        };
    },
    render: function() {
        var className = 'ltt_c-chart ltt_c-chart-column';
        if (this.props.className) {
            className  = [className, this.props.className].join(' ');
        }
        return (
            <div className={className}></div>
        )
    },

    componentDidMount: function () {
        this.setData(this.props.data);
    },

    componentWillReceiveProps: function (nextProps) {
        this.setData(nextProps.data);
    },

    setData: function(data, options) {
        this.props.data = data;
        if (data) {
            if (this.props.convert) {
                data = convertor.dispose(data);
            }
            var userHighchartOptions = this.getUserHighchartOptions('column');
            chart.column({
                title: this.props.title,
                $el: $(this.getDOMNode()),
                data: data
            }, _.extend({
                xAxis: {
                    categories: helper.getCategories(data)
                }
            }, userHighchartOptions));
        }
    },

    compareData: function (datas){
        chart.column({
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

module.exports = Column;