'use strict';
var sportTypes = [{
    cn: '健身',
    en: 'fitness'
}, {
    cn: '游泳',
    en: 'swimming'
}, {
    cn: '短运',
    en: 'se' //short exercise
}, {
    cn: '跑步',
    en: 'running'
}, {
    cn: '晨运',
    en: 'morning_exercise'
}];

exports.get = function (sports) {
    var result = [];
    if (!sports) {
        return result;
    }
    sports.forEach(function (sport) {
        result = result.concat(sportTypes.filter(function (sportType) {
            var langs = Object.keys(sportType);
            return langs.filter(function (lang) {
                return sportType[lang] === sport;
            }).length > 0;
        }));
    });
    return result;
};


