var React = require('react');


var LogClass = React.createClass({
    render: function () {
        var data = this.props.data;
        return (<span>{data.name}</span>);
    }
});

module.exports = LogClass;