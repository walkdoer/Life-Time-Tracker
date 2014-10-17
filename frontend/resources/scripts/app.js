define(function (require, exports) {

    'use strict';

    var router = require('./router');
    exports.initialize = function () {
        router.start();
    };

});
