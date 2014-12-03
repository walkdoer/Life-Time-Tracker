'use strict';

var Message = require('../message');

function outputPerspectives(statResult, perspectives) {
    if (typeof perspectives === 'string') {
        perspectives = [perspectives];
    }
    perspectives.forEach(function (key) {
        var perspectiveName = key.toLowerCase(),
            outputor;
        try {
            outputor = require('./perspectives/' + perspectiveName);
        } catch (e) {
            outputor = require('./default');
        }
        if (outputor) {
            //use name like sportPerspective to save the stat result
            var result = statResult[perspectiveName + 'Perspective'];
            if (result) {
                outputor.dispose(result);
            } else {
                Message.warn('the result has no perspective ' + perspectiveName);
            }
        }
    });

}

exports.outputPerspectives = outputPerspectives;
