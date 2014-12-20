/**
 * @jsx React.DOM
 */
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

/**components*/
var Progress = require('../Progress');


var Task = React.createClass({
    render: function () {
        var task = this.props.data;
        var url = '/projects/' + task.projectId + '/tasks/' + task._id;
        var className = "ltt_c-task";
        var progress;
        if (this.props.selected) {
            className += ' selected';
        }
        if (this.props.progress) {
            progress = (<Progress max={100} value={task.progress}/>);
        }
        return (
            <li className={className}>
                <span className="ltt_c-task-tag"><i className="fa fa-ellipsis-v"></i></span>
                <Link to={url}><span>{task.name}</span></Link>
                {progress}
            </li>
        );
    }
});

module.exports = Task;