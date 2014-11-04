/**
 * @jsx React.DOM
 */

var React = require('react');

var Header = React.createClass({

  /**
   * @return {object}
   */
  render: function() {
    return (
      <header class="ltt_c-header">
          <button class="btn"><i class="fa fa-bars"></i></button>
      </header>
    );
  }

});

module.exports = Header;
