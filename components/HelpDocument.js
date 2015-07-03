var React = require('react');
var cx = React.addons.classSet;
var Moment = require('moment');
var _ = require('lodash');
var marked = require('marked');
var loadFile = window.loadFile;


module.exports = React.createClass({

    propTypes: {
        className: React.PropTypes.string,
        title: React.PropTypes.string,
        src: React.PropTypes.string.isRequired
    },

    getInitialState: function () {
        return {
            docContent: ""
        };
    },

    render: function () {
        return (
            <div className="ltt_c-HelpDocument">
                {this.props.title ? <h1 className="title">{this.props.title}</h1> : null }
                <div className="markdown-body" dangerouslySetInnerHTML={{__html:this.renderDoc()}}></div>
            </div>
        );
    },

    renderDoc: function () {
        var renderer = new marked.Renderer();
        var docContent = this.state.docContent;
        renderer.image = function(href, title, text) {
            var arrTmp = href.split(' =');
            href = arrTmp[0];
            var sizeStr = arrTmp[1], sizeArr;
            if (sizeStr) {
                sizeArr = sizeStr.split('x');
            }
            var str = '<img src="' + href + '" alt="' + text + '"';
            if (sizeArr) {
                if (sizeArr.length === 1) {
                    str += ' style="width:' + sizeArr[0] + 'px;"';
                } else if (sizeArr.length === 2) {
                    str += ' style="width:' + sizeArr[0] + 'px;height:' + sizeArr[1] + 'px;"';
                }
            }
            str += '/>';
            return str;
        };
        var html = marked(docContent, {
            renderer: renderer
        });
        return html;
    },

    componentWillMount: function () {
        var that = this;
        loadFile(this.props.src, {
            onComplete: function (docContent) {
                that.setState({
                    docContent: docContent
                });
            },
            onError: function () {
                that.setState({
                    error: 'load help document failed!'
                });
            }
        });
    }
});