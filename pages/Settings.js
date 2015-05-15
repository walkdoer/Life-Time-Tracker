var React = require('react');
var RB = require('react-bootstrap');
var Button = RB.Button;
var ButtonToolbar = RB.ButtonToolbar;
var ButtonGroup = RB.ButtonGroup;
var Input = RB.Input;
var Grid = RB.Grid;
var Row = RB.Row;
var Col = RB.Col;


/** Components */
var Notify = require('../components/Notify');

/** Utils */
var DataAPI = require('../utils/DataAPI');

module.exports = React.createClass({

    getInitialState: function () {
        return {
            settings: {}
        };
    },

    render: function () {
        var settings = this.state.settings;
        return (
            <div className="ltt_c-page ltt_c-page-settings">
            <form className='ltt_c-page-settings-form'>
                <Grid>
                    <h3>Settings</h3>
                    <hr/>
                    <Row>
                        <Col xs={6} md={4}>
                            <Input name="name" type='text' label='Name' placeholder='input your name' value={settings.name} onChange={this.onSettingChange}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} md={4}>
                            <Input  name="startDate" type='text' label='Start Day'
                                placeholder='the first day start using this app'
                                help="Start date is the first day when you log your activity."
                                value={settings.startDate} onChange={this.onSettingChange}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={8}>
                        <div class="form-group">
                            <label class="control-label">
                                <span>Log file folder</span>
                            </label>
                            <input type="text" name="logDir"
                                placeholder="full path"
                                className="form-control"
                                webkitdirectory
                                onChange={this.onSettingChange}
                                value={settings.logDir}/>
                            <span className="help-block">where to save your log file, if you have Dropbox, you may set this option to your Dropbox folder , so you can backup your log data in Dropbox.</span>
                        </div>
                        </Col>
                    </Row>
                    <h3>Advanced settings</h3>
                    <hr/>
                    <Row>
                        <Col xs={4} md={2}>
                            <Input type='text' label='Server Port' placeholder='default is 3333' name="serverPort"
                                onChange={this.onSettingChange}
                                value={settings.serverPort}/>
                        </Col>
                    </Row>
                    <ButtonToolbar>
                        <Button bsStyle='primary' onClick={this.save}>Apply</Button>
                        <Button onClick={this.cancel}>Cancel</Button>
                    </ButtonToolbar>
                </Grid>
            </form>
            </div>
        );
    },

    componentDidMount: function () {
        this.loadSettings();
    },


    loadSettings: function () {
        var that = this;
        DataAPI.Settings.load().then(function (data) {
            that.setState({
                settings: data
            });
        });
    },

    save: function () {
        DataAPI.Settings.save(this.state.settings).then(function () {
            Notify.success('Change setting success!');
        }).catch(function (err) {
            Notify.error('Change settting failed', err);
        });
    },

    cancel: function () {
        this.back();
    },

    onSettingChange: function (e) {
        console.log(e);
        var settings = this.state.settings;
        var target = e.target;
        var name = target.name;
        settings[name] = target.value;
        this.setState({
            settings: settings
        });
    }

});


