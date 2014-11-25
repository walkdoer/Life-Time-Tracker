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
var _ = require('underscore');
var Column = React.createClass({
    displayName: 'column',
    render: function() {
        var className = 'ltt_c-chart ltt_c-chart-column';
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
                    categories: helper.getCategories(data)
                }
            });
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