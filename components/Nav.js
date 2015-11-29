/**
 * @jsx React.DOM
 */

var React = require('react');
var Menu = require('./Menu');
var Logo = require('./Logo');
var _ = require('lodash');
var Moment = require('moment');
var setIntervalMinxin = require('../components/mixins/setInterval');
var Logo = require('./Logo');

var Nav = React.createClass({

    mixins: [setIntervalMinxin],

    getInitialState: function () {
        return {
            img: this.getImgDependOnHour()
        };
    },

    /**
     * @return {object}
     */
    render: function() {
        var items = [{
            text: 'Dashboard',
            key: 'dashboard',
            path: 'dashboard',
            icon: 'fa fa-dashboard'
        }, {
            text: 'Reports',
            key: 'reports',
            path: 'reports',
            icon: 'fa fa-bar-chart'
        }, {
            text: 'Logs',
            key: 'logs',
            path: 'logs',
            icon: 'fa fa-file'
        }, {
            text: 'Projects',
            key: 'projectManage',
            path: 'projectManage',
            icon: 'fa fa-rocket'
        }, {
            text: 'Tasks',
            key: 'projects',
            path: 'projects',
            icon: 'fa fa-tasks'
        }, {
            text: "Editor",
            key: "logEditor",
            path: "/logEditor/" + new Moment().format('YYYY-MM-DD'),
            icon: "fa fa-edit"
        }, {
            text: 'Affects',
            key: 'affects',
            path: "affects",
            icon: "fa fa-heartbeat"
        }, {
            text: 'Goals',
            key: 'goals',
            path: 'goals',
            icon: "fa fa-trophy"
        }, {
            text: 'Calendar',
            key: 'calendar',
            path: 'calendar',
            icon: 'fa fa-calendar'
        }, {
            text: 'Routine',
            key: 'routine',
            path: 'routine',
            icon: 'fa fa-bullseye'
        }];

        //var isActive = this.isActive(this.props.to, this.props.params, this.props.query);
        return (
            <nav className="ltt_c-nav" style={{backgroundImage: 'url(./images/' + this.state.img + ')', backgroundSize: "cover"}}>
                <Logo title="LTT"/>
                <Menu
                    items={items}
                    activeKey={this.props.initialMenuItem}
                    text={false} //only icon
                    onMenuClick={this.onMenuClick}
                />
            </nav>
        );
    },

    componentDidMount: function () {
        var that = this;
        this.setInterval(function () {
            that.setState({
                img: that.getImgDependOnHour()
            });
        }, 600000);
    },


    onMenuClick: function (menuItem) {
        if (_.isFunction(this.props.onMenuClick)) {
            this.props.onMenuClick(menuItem);
        };
    },

    getImgDependOnHour: function () {
        var hour = new Moment().hour();
        var hour = new Moment().hour();
        var prefix = 'n';
        var ext = '.png';
        if (hour >= 0 && hour < 5){
            img = prefix + 9 + ext;
        } else if (hour >= 5 && hour < 8) {
            img = prefix + 1 + ext;
        } else if(hour >= 8 && hour < 10) {
            img = prefix + 2 + ext;
        } else if (hour >= 10 && hour < 12) {
            img = prefix + 3 + ext;
        } else if (hour >= 12 && hour < 14) {
            img = prefix + 4 + ext;
        } else if (hour >= 14 && hour < 17) {
            img = prefix + 5 + ext;
        } else if (hour >= 17 && hour < 19) {
            img = prefix + 6 + ext;
        } else if (hour >= 19 && hour < 20) {
            img = prefix + 7 + ext;
        } else if (hour >= 20 && hour < 22) {
            img = prefix + 8 + ext;
        } else if (hour >= 22 && hour <= 23) {
            img = prefix + 9 + ext;
        }
        return img
    }

});

module.exports = Nav;
