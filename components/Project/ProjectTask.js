/**
 * @jsx React.DOM
 */

var React = require('react');
var Moment = require('moment');


module.exports = React.createClass({
    render: function () {
        return (
            <div className="ltt_c-projectTask">
                <main>
                    tasks
                </main>
                <aside className="ltt_c-projectTask-logs">
                    logStrlogs
                </aside>
            </div>
        );
    }
});