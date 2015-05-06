/**
 * Bar Chart
 */
var React = require('react');
var chart = require('./chart');
var helper = require('./helper');
var convertor = require('../../convertors/column');
var compareConvertor = require('../../convertors/compareColumn');
var _ = require('lodash');
var extend = require('extend');
var CommonFunction = require('./CommonFunction');
var Bar = React.createClass({
    displayName: 'bar',
    mixins: [ CommonFunction ],

    getDefaultProps: function () {
        return {
            dataLabels: true,
            onPointClick: function () {}
        };
    },
    render: function() {
        var className = 'ltt_c-chart ltt_c-chart-bar';
        if (this.props.className) {
            className  = [className, this.props.className].join(' ');
        }
        return(
            <div className={className}></div>
        );
    },

    componentDidMount: function () {
        this.setData(this.props.data);
    },

    componentWillReceiveProps: function (nextProps) {
        this.setData(nextProps.data);
    },

    setData: function(data) {
        if (!data) {
            return;
        }
        this.props.data = data;
        var that = this;
        var userHighchartOptions = this.getUserHighchartOptions('bar');
        chart.bar({
            title: this.props.title,
            $el: $(this.getDOMNode()),
            data: convertor.dispose(data)
        }, extend(true, {
            xAxis: {
                categories: helper.getCategories(data)
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                var data = this.series.data;
                                var color = this.series.color;
                                for (var i = 0; i < data.length; i++) {
                                    data[i].update({ color: color }, true, false);
                                }
                                this.update({ color: '#f00' }, true, false);
                                that.props.onPointClick({
                                    category: this.category,
                                    value: this.y
                                });
                            }
                        }
                    }
                }
            },
        }, userHighchartOptions));
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