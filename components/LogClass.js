var React = require('react');
var _ = require('lodash');
var config = require('../conf/config');

var LogClass = React.createClass({
    render: function () {
        var icon = {};
        config.classes.forEach(function (cls) {
            icon[cls._id] = cls.icon;
        });
        var data = this.props.data;
        var iconClass, name;
        if (_.isString(data)) {
            iconClass = icon[data];
            name = data;
        } else if (_.isObject(data) && data.id) {
            iconClass = icon[data.id];
            name = data.name;
        }
        return (
            <span className="ltt_c-logClass">
                <i className={['fa', 'fa-' + iconClass].join(' ')}></i>
                {name}
            </span>
        );
    }
});

module.exports = LogClass;