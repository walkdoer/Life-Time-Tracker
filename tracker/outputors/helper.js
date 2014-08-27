'use strict';
var msg = require('../message');
function outputPerspectives(statResult, perspective) {
    var perspectives;
    if (perspective) {
        perspectives = [perspective];
    } else {
        perspectives = ['sport'];
    }
    perspectives.forEach(function (key) {
        var perspectiveName = key.toLowerCase(),
            outputor;
        try {
            outputor = require('./' + perspectiveName);
        } catch (e) {
            msg.warn('Outputor for Perspective ' + perspectiveName + ' is Not Exsit');
        }
        if (outputor) {
            //use name like sportPerspective to save the stat result
            var name = perspectiveName + 'Perspective';
            outputor.dispose(statResult[name]);
        }
    });

}

exports.outputPerspectives = outputPerspectives;
