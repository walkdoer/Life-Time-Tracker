var Router = require('react-router');
var extend = require('extend');
var _ = require('lodash');

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
        /*if (_.isFunction(this.getStateFromParams()))*/
    }
};