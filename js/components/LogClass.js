var React = require('react');

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
        return (
            <span className="ltt_c-logClass">
                <i className={['fa', icon[data.code]].join(' ')}></i>
                {data.name}
            </span>
        );
    }
});

module.exports = LogClass;