/**
 * compareData mixin
 */

var _ = require('lodash');

module.exports = {

    setData: function (statData) {
        var that = this;
        _.each(that.refs, function (ref, refName) {
            var data, getData;
            if (refName.indexOf('chart_') === 0) {
                var dataName = refName.split('_')[1];
                var compareChartRefs = this.compareChartRefs || [];
                var inCompareChartRefs = compareChartRefs.filter(function (refCfg) {
                    return refCfg.refName === refName;
                }).length > 0;
                if (that.props.compare === false || !inCompareChartRefs) {
                    getData = that.chartDatas[refName];
                    if (!getData) {
                        data = statData[dataName];
                    } else if (_.isFunction (getData)) {
                        data = getData.call(that, statData);
                    } else if (_.isString(getData)) {
                        data = statData[getData];
                    }
                    ref.setData(data);
                }
            }
        });
    },


    compareData: function (results) {

        var compareChartRefs = this.compareChartRefs;
        var compareData = {};
        results.map(function (res) {
            var params = res.params,
                statData = res.data;
            var dayCount = statData.days.length,
                title;
            if (dayCount === 1) { // means single day
                var day = statData.days[0];
                title = day.date;
                createCompareData.call(this, title, day);
            } else { //means multiple days
                title = [params.start, params.end].join(' to ');
                createCompareData.call(this, title, statData);
            }
        }, this);

        function createCompareData (title, data) {
            compareChartRefs.forEach(function (chartRefCfg) {
                var chartRef, chartData, chartRefName, userGetDataFun;
                chartRefName = chartRefCfg.refName;
                var getData = chartRefCfg.getData;
                if (_.isString(getData)) {
                    userGetDataFun = function (data) {
                        return data[getData];
                    };
                } else if (_.isFunction (getData)) {
                    userGetDataFun = getData;
                }
                chartRef = this.refs[chartRefName];
                chartData = composeData(userGetDataFun(data), title);
                var store = compareData[chartRefName];
                if (!store) {
                    compareData[chartRefName] = store = [];
                }
                store.push(chartData);
            }, this);
        }

        function composeData(values, title) {
            return {
                name: title,
                values: values
            };
        }

        compareChartRefs.forEach(function (chartRefCfg) {
            var chartRefName = chartRefCfg.refName;
            this.refs[chartRefName].compareData(compareData[chartRefName]);
        }, this);

    }
};