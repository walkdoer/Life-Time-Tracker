var React = require('react');
var _ = require('lodash');
var icon = {
    NT: 'fa-briefcase',
    WK: 'fa-desktop',
    SPR: 'fa-bicycle',
    STU: 'fa-mortar-board',
    TK: 'fa-lightbulb-o',
    BRK: 'fa-smile-o'
};

var LogClass = React.createClass({
    render: function () {
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
                <i className={['fa', iconClass].join(' ')}></i>
                {name}
            </span>
        );
    }
});

module.exports = LogClass;