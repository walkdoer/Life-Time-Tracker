'use strict';
var _ = require('lodash');
var Highcharts = require('highcharts');

// Make monochrome colors and set them as default for all pies
/*Highcharts.getOptions().plotOptions.pie.colors = (function () {
    var colors = [],
        base = Highcharts.getOptions().colors[0],
        i;

    for (i = 0; i < 10; i += 1) {
        // Start out with a darkened base color (negative brighten), and end
        // up with a much brighter color
        colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
    }
    return colors;
}());*/

exports.timeline = function(options) {
    var data = options.data;
    var highchartsOptions = {
        title: {
            text: options.title
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%m-%e',
                week: '%e. %b',
                month: '%b \'%y',
                year: '%Y'
            }
        },
        yAxis: [{
            title: '', //不需要标题
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year
                hour: '%H:%M',
                day: '%H:%M'
            }
        }, {
            title: '长度',
            opposite: true,
            min: 0,
            labels: {
                format: '{value} hours',
            }
        }],
        tooltip: {
            //headerFormat: '<b>{series.name}</b><br>',
            //pointFormat: '{point.x:%m-%e}: {point.y:%H:%m}',
            pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y:%H:%M}</b><br/>',
            crosshairs: true,
            shared: true
        },

        series: data.series
    };
    /*
    if (options.granularity === 'day') {
        highchartsOptions.xAxis.tickInterval = 24 * 3600 * 1000;
    }*/
    options.$el.highcharts(highchartsOptions);
};


exports.pie = function(options, highchartOptions) {
    var pieOptions = {
        chart: {
            //plotBackgroundColor: null,
            //plotShadow: false
        },
        title: {
            text: options.title
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false,
                    //format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    //style: {
                    //    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    //}
                },
                showInLegend: true
            }
        },
        series: [options.data]
    };

    pieOptions = _.extend(pieOptions, highchartOptions);

    options.$el.highcharts(pieOptions);
};

exports.bar = function (options, highchartOptions) {
    var columnOptions = {
        chart: {
            type: 'bar'
            //plotBackgroundColor: null,
            //plotShadow: false
        },
        title: {
            text: options.title
        },
        series: options.data
    };

    columnOptions = _.extend(columnOptions, highchartOptions);

    options.$el.highcharts(columnOptions);
};

exports.column = function (options, highchartOptions) {
    var columnOptions = {
        chart: {
            type: 'column'
            //plotBackgroundColor: null,
            //plotShadow: false
        },
        title: {
            text: options.title
        },
        series: options.data
    };

    columnOptions = _.extend(columnOptions, highchartOptions);

    options.$el.highcharts(columnOptions);
};
