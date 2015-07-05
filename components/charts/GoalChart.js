var React = require('react');
var Moment = require('moment');
var _ = require('lodash');
var numeral = require('numeral');
module.exports = React.createClass({
    displayName: 'MonthCountDown',
    getDefaultProps: function () {
        return {
            dataLabels: true,
            itemPadding: 10
        };
    },
    render: function() {

        return (
            <div className="ltt_c-chart-GoalChart">
                <svg></svg>
            </div>
        );
    },

    componentDidMount: function () {
        this.plot();
    },

    componentDidUpdate: function () {
        this.plot();
    },


    plot: function (options) {
        var data = this.props.data;
        var hasData = !_.isEmpty(data);
        //if (!hasData) return;
        var start = this.props.start;
        data = _.range(0, new Moment(this.props.end).diff(start, 'day')).map(function (i) {
            var target = data.filter(function (d) {
                var date = new Moment(d.date).date() - 1;
                return date === i;
            })[0];
            if (target) {
                return target;
            } else {
                return {
                    date: new Moment(start).add(i, 'day').toDate(),
                    count: -1
                };
            }
        });
        var dataLen = data.length;
        var width = this.props.width;
        var height = this.props.height;
        var threshold = this.props.threshold;
        var itemPadding = this.props.itemPadding;
        var rowItemCount = this.props.rowItemCount;
        var row;
        if (rowItemCount) {
            row = Math.ceil(dataLen / rowItemCount);
        } else {
            rowItemCount = dataLen;
            row = 1;
        }
        var itemWidth = (width - (rowItemCount - 1) * itemPadding)/ rowItemCount;
        var itemHeight = (height - (row - 1) * itemPadding) / row;
        var radius = Math.min(itemWidth, itemHeight) / 2;
        var svg = d3.select(this.getDOMNode()).select('svg');
        var topPadding = (height - 2 * radius * row - (row - 1) * itemPadding) / 2;
        svg.style('height', height);
        svg.style('width', width);
        var circle = svg.selectAll('circle')
            //.style('fill', 'rgb(238,238, 238)')
            .data(data, function (d) {
                return d.date;
            });
        circle.enter()
            .append("circle")
            .attr("cy", function (d, i) {
                var currentRow = Math.floor(i / rowItemCount) + 1;
                return topPadding + (2 * currentRow - 1) * radius + (currentRow - 1) * itemPadding;
            })
            .attr("cx", function(d, i) {
                i = i % rowItemCount;
                return (2 * i + 1) * radius + i * itemPadding;
            })
            .attr("r", function(d) {
                return radius;
            })
            .style("fill", function (d) {
                if (d.count === -1) {
                    return 'rgb(238,238, 238)';
                }
                if (d.count < threshold) {
                    return 'red';
                } else {
                    return 'rgb(48, 201, 79)';
                }
            });
        circle.exit().remove();
    }
});