/**
 * compareData mixin
 */

var _ = require('lodash');

module.exports = {
    compareData: function (results) {
        var categoryTime = [],
            tagTime = [],
            projectTime = [];
        results.map(function (res) {
            var params = res.params,
                statData = res.data;
            var dayCount = statData.days.length,
                title;
            if (dayCount === 1) { // means single day
                var day = statData.days[0];
                title = day.date;
                categoryTime.push(getData(day.categoryPerspective, title, 'categoryTime'));
                tagTime.push(getData(day, title, 'tagTime', 0, 20));
                projectTime.push(getData(day, title, 'projectTime', 0, 20));
            } else { //means multiple days
                title = [params.start, params.end].join(' to ');
                categoryTime.push(getData(statData.categoryPerspective, title, 'categoryTime'));
                tagTime.push(getData(statData, title, 'tagTime', 0, 20));
                projectTime.push(getData(statData, title, 'projectTime', 0, 20));
            }
        });

        function getData(statData, title, dataName, sliceStart, length) {
            var values = statData[dataName];
            if (_.isArray(values)) {
                if (sliceStart !== undefined && length !== undefined) {
                    values = values.slice(sliceStart, length);
                }
            }
            return {
                name: title,
                values: values
            };
        }

        this.refs.categoryTime.compareData(categoryTime);
        this.refs.tagTime.compareData(tagTime);
        this.refs.projectTime.compareData(projectTime);
    }
};