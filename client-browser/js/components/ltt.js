/**
 * application bootstrap
 * @jsx React.DOM
 */



var React = require('react');

var Header = require('./ltt.header');


var Ltt = React.createClass({

    render: function () {
        return (
            <div>
                <Header />
            </div>
        );
    }
});

module.exports = Ltt;