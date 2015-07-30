'use strict';

var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var _ = require('lodash');
var Moment = require('moment');
var Q = require('q');


module.exports = React.createClass({

    propTypes: {
        activitys: React.PropTypes.array
    },

    getDefaultProps: function () {
        return {
            activitys: []
        };
    },

    render: function () {
        var activitys = this.props.activitys;
        return (
            <ul className="ltt_c-VerticleTimeline cbp_tmtimeline">
            {
                activitys.map(function (activity) {
                    return <Activity data={activity}/>
                })
            }
            </ul>
        );
    }
});


var Activity = React.createClass({

    render: function () {
        var activity = this.props.data;
        var mStart = Moment(activity.start);
        return (
            <li className="ltt_c-VerticleTimeline-Activity">
                <time className="cbp_tmtime" datetime={activity.start}>
                    <span className="cbp_date">{mStart.format('YYYY-MM-DD')}</span>
                    <span className="cbp_time">{mStart.format('HH:mm')}</span>
                </time>
                <div className="cbp_tmicon cbp_tmicon-phone"></div>
                <div className="cbp_tmlabel">
                    <div className="arrow"></div>
                    <div className="cbp_title">{activity.title}</div>
                    <div className="cbp_content">{activity.content}</div>
                </div>
            </li>
        );
    }
})