'use strict';
var _ = require('lodash');
var $ = require('jquery');
window.$ = window.jQuery = $;
var Highcharts = require('highcharts-browserify');

//在这里添加highchart的全局设置
Highcharts.setOptions({
    credits: {
        enabled: false
    },
    colors: ['#47bac1', '#F0A0A5', '#ffea88', '#9999ff','#2f7ed8', '#009944', , '#F04C3B' , '#878bb6', '#ff8153','#b2d767'],
    //colors: ['#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
    //colors: ['#1bd0dc', '#f9b700', '#eb6100', '#009944', '#eb6877', '#5674b9', '#a98fc2', '#9999ff', '#1c95bd', '#9dd30d'],
    global: {
        useUTC: false
    },
    plotOptions: {
        series: {
            // animation: false
            lineWidth: 1
        }
    },
    tooltip: {
        dateTimeLabelFormats: {
            millisecond:"%A, %b %e, %H:%M:%S.%L",
            second:"%A, %b %e, %H:%M:%S",
            minute:"%A, %b %e, %H:%M",
            hour:"%A, %b %e, %H:%M",
            //day:"%A, %b %e, %Y",
            day: "%Y-%m-%d",
            week:"Week from %A, %b %e, %Y",
            month:"%B %Y",
            year:"%Y"
        }
    }
});
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
        plotOptions: {
            series: {
                marker: {
                    enabled: true,
                    symbol: 'circle',
                    radius: 2,
                    // if you want to remove hover efect, add the following lines
                    states: {
                        hover: {
                            radius: 3
                        }
                    }
                }
            }
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

exports.line = function (options, highchartOptions) {
    var lineOptions = {
        chart: {
            type: 'line'
            //plotBackgroundColor: null,
            //plotShadow: false
        },
        title: {
            text: options.title
        },
        series: options.data
    };

    lineOptions = _.extend(lineOptions, highchartOptions);

    options.$el.highcharts(lineOptions);
};