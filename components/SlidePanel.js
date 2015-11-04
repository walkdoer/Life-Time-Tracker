var React = require('react');
var mui = require('material-ui');
var KeyCode = require('material-ui/lib/utils/key-code');
var StylePropable = require('material-ui/lib/mixins/style-propable');
var AutoPrefix = require('material-ui/lib/styles/auto-prefix');
var Transitions = require('material-ui/lib/styles/transitions');
var WindowListenable = require('material-ui/lib/mixins/window-listenable');
var Overlay = require('material-ui/lib/overlay');
var Paper = require('material-ui/lib/paper');

module.exports = React.createClass({

  displayName: "SlidePanel",

  mixins: [StylePropable, WindowListenable],

  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  propTypes: {
    className: React.PropTypes.string,
    docked: React.PropTypes.bool,
    header: React.PropTypes.element,
    onChange: React.PropTypes.func,
    onOpen: React.PropTypes.func,
    onTransitionEnd: React.PropTypes.func,
    onClose: React.PropTypes.func,
    openRight: React.PropTypes.bool,
  },

  windowListeners: {
    'keyup': '_onWindowKeyUp',
    'resize': '_onWindowResize'
  },

  getDefaultProps: function() {
    return {
      onTransitionEnd: function() {},
      docked: true,
      width: 200,
      duration: 450
    };
  },

  getInitialState: function() {
    return {
      open: this.props.open,
      maybeSwiping: false,
      swiping: false
    };
  },
  
  componentDidMount: function() {
    this._enableSwipeHandling();
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      open: nextProps.open
    });
  },
  
  componentDidUpdate: function(prevProps, prevState) {
    this._enableSwipeHandling();
  },

  componentWillUnmount: function() {
    this._disableSwipeHandling();
  },

  toggle: function(options) {
    if (options) {
      this._width = options.width;
    }
    this.setState({ open: !this.state.open }, function() {
      var that = this;
      this.afterOpen();
    });
    return this;
  },

  close: function() {
    this.setState({ open: false });
    if (this.props.onClose) this.props.onClose();
    return this;
  },

  afterOpen: function () {
    var that = this;
    if (this.state.open) {
      var timer = setTimeout(function () {
        clearTimeout(timer);
        that.props.onTransitionEnd();
      }, this.props.duration);
    }
  },

  getWidth: function () {
    return this._width || this.props.width;
  },

  open: function(options) {
    if (options) {
      if (options.width) {
        this._width = options.width;
      }
    }
    this.setState({ open: true }, function () {
      this.afterOpen();
    });
    if (this.props.onOpen) this.props.onOpen();
    return this;
  },


  getStyles: function() {
    var x = this._getTranslateMultiplier() * (this.state.open ? 0 : this._getMaxTranslateX()) + 'px';
    var styles = {
      root: {
        height: '100%',
        width: this.getWidth(),
        position: this.props.position || 'absolute',
        zIndex: this.props.zIndex || 10,
        left: 0,
        top: 0,
        transform: 'translate3d(' + x + ', 0, 0)',
        transition: !this.state.swiping && Transitions.easeOut(this.props.duration + 'ms'),
        overflow: 'hidden'
      },
      rootWhenOpenRight: {
        left: 'auto',
        right: '0'
      }
    };

    return styles;
  },

  render: function() {
    var overlay;

    var styles = this.getStyles();
    if (!this.props.docked) {
      overlay = <Overlay ref="overlay"
                         show={this.state.open}
                         transitionEnabled={!this.state.swiping}
                         onTouchTap={this._onOverlayTouchTap} />;
    }


    return (
      <div className={"ltt_c-SlidePanel " + (this.props.className || '')}>
        {overlay}
        <Paper
          className="paper"
          ref="clickAwayableElement"
          zDepth={2}
          rounded={false}
          transitionEnabled={!this.state.swiping}
          style={this.mergeAndPrefix(
            styles.root, 
            this.props.openRight && styles.rootWhenOpenRight,
            this.props.style)}>
            {this.props.header}
            {this.props.children}
        </Paper>
      </div>
    );
  },



  _onOverlayTouchTap: function() {
    this.close();
  },

  _onWindowKeyUp: function(e) {
    if (e.keyCode == KeyCode.ESC &&
        !this.props.docked &&
        this.state.open) {
      this.close();
    }
  },
  
  _onWindowResize: function(e) {

  },

  _getMaxTranslateX: function() {
    return this.getWidth() + 10;
  },

  _getTranslateMultiplier: function() {
    return this.props.openRight ? 1 : -1;
  },

  _enableSwipeHandling: function() {
    if (this.state.open && !this.props.docked) {
      document.body.addEventListener('touchstart', this._onBodyTouchStart);
    } else {
      this._disableSwipeHandling();
    }
  },

  _disableSwipeHandling: function() {
    document.body.removeEventListener('touchstart', this._onBodyTouchStart);
  },

  _onBodyTouchStart: function(e) {
    var touchStartX = e.touches[0].pageX;
    var touchStartY = e.touches[0].pageY;
    this.setState({
      maybeSwiping: true,
      touchStartX: touchStartX,
      touchStartY: touchStartY
    });

    document.body.addEventListener('touchmove', this._onBodyTouchMove);
    document.body.addEventListener('touchend', this._onBodyTouchEnd);
    document.body.addEventListener('touchcancel', this._onBodyTouchEnd);
  },

  _onBodyTouchMove: function(e) {
    var currentX = e.touches[0].pageX;
    var currentY = e.touches[0].pageY;

    if (this.state.swiping) {
      e.preventDefault();
      var translateX = Math.min(
                         Math.max(
                           this._getTranslateMultiplier() * (currentX - this.state.swipeStartX),
                           0
                         ),
                         this._getMaxTranslateX()
                       );

      var leftNav = React.findDOMNode(this.refs.clickAwayableElement);
      leftNav.style[AutoPrefix.single('transform')] =
        'translate3d(' + (this._getTranslateMultiplier() * translateX) + 'px, 0, 0)';
      this.refs.overlay.setOpacity(1 - translateX / this._getMaxTranslateX());
    } else if (this.state.maybeSwiping) {
      var dXAbs = Math.abs(currentX - this.state.touchStartX);
      var dYAbs = Math.abs(currentY - this.state.touchStartY);
      // If the user has moved his thumb ten pixels in either direction,
      // we can safely make an assumption about whether he was intending
      // to swipe or scroll.
      var threshold = 10;

      if (dXAbs > threshold && dYAbs <= threshold) {
        this.setState({
          swiping: true,
          swipeStartX: currentX
        });
      } else if (dXAbs <= threshold && dYAbs > threshold) {
        this._onBodyTouchEnd();
      }
    }
  },

  _onBodyTouchEnd: function() {
    var shouldClose = false;

    if (this.state.swiping) shouldClose = true;

    this.setState({
      maybeSwiping: false,
      swiping: false
    });

    // We have to call close() after setting swiping to false,
    // because only then CSS transition is enabled.
    if (shouldClose) this.close();

    document.body.removeEventListener('touchmove', this._onBodyTouchMove);
    document.body.removeEventListener('touchend', this._onBodyTouchEnd);
    document.body.removeEventListener('touchcancel', this._onBodyTouchEnd);
  }
});
