var Router = require('react-router');
var extend = require('extend');

module.exports = {
    mixins: [Router.State],
    initParams: function () {
        var params = this.getParams();
        this.params = params;
    },

    getInitialState: function () {
        this.initParams();
        return {};
    },
    componentWillReceiveProps: function () {
        this.initParams();
    }
};