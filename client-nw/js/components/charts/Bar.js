/**
 * Bar Chart
 */
var React = require('react');
var chart = require('./chart');
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
                categories: this.getCategories(data)
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
                categories: this.getCategoriesFromArray(datas)
            }
        });
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
    },

    getCategoriesFromArray: function (datas) {
        var categorys = [];
        datas.forEach(function (data) {
            categorys = categorys.concat(this.getCategories(data.values));
        }, this);
        return _.uniq(categorys);
    }
});

module.exports = Bar;