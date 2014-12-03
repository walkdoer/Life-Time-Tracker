/**
 * Action
 */

'use strict';


exports.get = function (actionName, options) {

    try {
        return require('./actions/' + actionName);
    } catch (e) {
        return null;
    }
};
