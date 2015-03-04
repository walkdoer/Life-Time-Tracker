/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
var Moment = require('moment');
var ReactBootStrap = require('react-bootstrap');
var TabbedArea = ReactBootStrap.TabbedArea;
var TabPane = ReactBootStrap.TabPane;
var Modal = ReactBootStrap.Modal;
var ModalTrigger = ReactBootStrap.ModalTrigger;
var Button = ReactBootStrap.Button;

var positiveAffects = [
    { name: '兴奋' },
    { name: '专注'},
    { name: '幸福'},
    { name: '宁静'}
], negativeAffects = [
    { name: '悲伤' },
    { name: '愤怒'},
    { name: '郁闷'},
    { name: '疲惫'}
];
module.exports = React.createClass({


    render: function () {

        return <div className="ltt_c-page ltt_c-page-Affects">
            <div className="ltt_c-page-Affects-content">
                <div className="ltt_c-page-Affects-content-header">
                    <div className="ltt_c-page-Affects-content-header-title">情绪管理</div>
                    <ModalTrigger modal={<RecordModal className="ltt_c-RecordModal"/>}>
                        <Button bsSize="medium">New Record</Button>
                    </ModalTrigger>
                </div>
            </div>
            <aside className="ltt_c-page-Affects-sidebar">
                <TabbedArea defaultActiveKey={1} animation={false}>
                    <TabPane eventKey={1} tab="Positive">
                        <AffectsList items={positiveAffects}/>
                    </TabPane>
                    <TabPane eventKey={2} tab="Negative">
                        <AffectsList items={negativeAffects}/>
                    </TabPane>
                </TabbedArea>
            </aside>
        </div>
    }
});


var RecordModal = React.createClass({
    render: function() {
        return (
            <Modal {...this.props} bsStyle="primary" title="记录情绪" animation={true}>
                <div className="modal-body">
                    <h1>Positive</h1>
                    <div className="affectList">
                        {positiveAffects.map(function (affect){
                            return <AffectRange affect={affect}/>;
                        })}
                    </div>
                    <h1>Negative</h1>
                    <div className="affectList">
                        {negativeAffects.map(function (affect){
                            return <AffectRange affect={affect}/>;
                        })}
                    </div>
                </div>
                <div className="modal-footer">
                    <Button onClick={this.props.onRequestHide}>Close</Button>
                    <Button bsStyle="primary" onClick={this.props.onRequestSave}>Save</Button>
                </div>
            </Modal>
        );
    }
});

var AffectRange = React.createClass({

    getInitialState: function () {
        return {
            value: this.props.value || 0
        };
    },

    render: function() {
        var affect = this.props.affect;
        return (
            <div className="ltt_c-AffectRange">
                <label for={affect.name}>{affect.name} {this.state.value}</label>
                <input id={affect.name} type ="range" min ="-5" max="5" step ="1" onChange={this.onChange}/>
            </div>
        );
    },

    onChange: function (e) {
        this.setState({
            value: e.target.value
        });
    }
});

var AffectsList = React.createClass({


    render: function () {
        return <div className="ltt_c-AffectsList">
            {this.props.items.map(function(affect) {
                return <div className="ltt_c-AffectsList-item">{affect.name}</div>
            })}
            <div className="ltt_c-AffectsList-item ltt_c-AffectsList-add"><i className="fa fa-plus"></i></div>
        </div>
    },
});
