var React = require('react');
var _ = require('lodash');
var config = require('../conf/config');

var LogClass = React.createClass({
    render: function () {
        var cls = this.props.data;
        var iconClass, name;
        if (_.isString(cls)) {
            name = cls;
        } else if (_.isObject(cls)) {
            if (cls.icon) {
                iconClass = ['fa', cls.icon].join(' ');
            } else {
                iconClass = '';
            }
            name = cls.name;
        }
        return (
            <span className="ltt_c-logClass" data-id={cls._id}>
                <i className={iconClass}></i>
                {name}
            </span>
        );
    }
});

module.exports = LogClass;