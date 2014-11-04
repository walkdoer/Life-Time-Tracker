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
      <header className="ltt_c-header">
          <button className="btn btn-primary ltt_c-header-barBtn js-open-sidebar"><i className="fa fa-bars"></i></button>
          <button className="btn btn-primary ltt_c-header-cfgBtn js-open-config"><i className="fa fa-gear"></i></button>
      </header>
    );
  }

});

module.exports = Header;
