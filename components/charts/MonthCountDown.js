/**
 * Month CountDown
 */

'use strict';
var React = require('react');
var R = React.DOM;
var Moment = require('moment');
var _ = require('lodash');
var numeral = require('numeral');
module.exports = React.createClass({
    displayName: 'MonthCountDown',
    getDefaultProps: function () {
        return {
            dataLabels: true
        };
    },
    render: function() {
        var birthday = this.props.birthday;
        var lifeYear = this.props.lifeYear;
        var monthToLive = this._calculateLifeMonth(birthday, lifeYear);
        var livedMonth = new Moment().diff(birthday, 'month');

        return (
            <div className="ltt_c-chart ltt_c-chart-MonthCountDown">
                <h1>Total: {monthToLive}/ Lived: {livedMonth}({numeral(livedMonth/monthToLive).format('0.00 %')})</h1>
                <svg></svg>
            </div>
        );
    },

    componentDidMount: function () {
        this.plot(this.props);
    },

    plot: function (options) {
        var $el = $(this.getDOMNode());
        options = _.extend({
            itemPadding: 3,
            padding: 5,
            width: $el.width(),
            height: $el.height()
        }, options);
        var lifeYear = options.lifeYear;
        var birthday = options.birthday;
        var lifeMonth = this._calculateLifeMonth(birthday, lifeYear);
        var width = options.width;
        var height = options.height;
        var monthData = _.range(1, lifeMonth);
        var countDown = d3.select(this.getDOMNode()).select('svg');

        countDown.style('height', height);
        countDown.style('width', width);
        //countDown.style('border', '1px solid #ccc');

        var columnNum, rowNum;
        columnNum = rowNum = Math.ceil(Math.sqrt(lifeMonth));
        var itemHoriPadding, itemVertPadding;
        itemHoriPadding = itemVertPadding= options.itemPadding;
        var padding = options.padding;

        var rectWidth = (width - padding * 2 - itemHoriPadding * (columnNum - 1)) / columnNum;
        var rectHeight = (height - padding * 2 - itemVertPadding * (rowNum - 1)) / rowNum;

        var month = countDown.selectAll("circle")
                .data(monthData)
                .text(String);

        var livedMonth = new Moment().diff(birthday, 'month');

        month.enter()
            .append("rect")
            .text(String)
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .attr("x", function (d) {
                var col = (d - 1) % columnNum;
                return col * (itemHoriPadding + rectWidth) + padding;
            })
            .attr("y", function (d) {
                var row = Math.floor((d -1) / columnNum);
                return row * (itemVertPadding + rectHeight) + padding;
            })
            .style("fill", function(d) {
                if (d < livedMonth) {
                    return 'red';
                } else {
                    return '#43B2DF';
                }
            });

        // Exit…
        month.exit().remove();
    },


    _calculateLifeMonth: function(birthday, lifeYear) {
        var mBirthday = new Moment(birthday);
        var month = mBirthday.month();
        return lifeYear * 12 - month;
    }
});