/**
 * Sidebar
 * @jsx React.DOM
 */

var React = require('react');
var SearchBox = React.createClass({

    render: function() {
        return (
            <div className="ltt_c-searchBox">
                <i className="fa fa-search"></i>
                <input placeholder={this.props.placeholder}/>
                <i className="fa fa-times-circle"></i>
            </div>
        );
    }
});

module.exports = SearchBox;
