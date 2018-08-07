'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _HTMLAudioElement2 = require('./HTMLAudioElement');

var _HTMLAudioElement3 = _interopRequireDefault(_HTMLAudioElement2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HAVE_NOTHING = 0;
var HAVE_METADATA = 1;
var HAVE_CURRENT_DATA = 2;
var HAVE_FUTURE_DATA = 3;
var HAVE_ENOUGH_DATA = 4;

var _innerAudioContext = new WeakMap();
var _src = new WeakMap();
var _loop = new WeakMap();
var _autoplay = new WeakMap();

var Audio = function (_HTMLAudioElement) {
  _inherits(Audio, _HTMLAudioElement);

  function Audio(url) {
    _classCallCheck(this, Audio);

    var _this = _possibleConstructorReturn(this, (Audio.__proto__ || Object.getPrototypeOf(Audio)).call(this));

    _this.HAVE_NOTHING = HAVE_NOTHING;
    _this.HAVE_METADATA = HAVE_METADATA;
    _this.HAVE_CURRENT_DATA = HAVE_CURRENT_DATA;
    _this.HAVE_FUTURE_DATA = HAVE_FUTURE_DATA;
    _this.HAVE_ENOUGH_DATA = HAVE_ENOUGH_DATA;
    _this.readyState = HAVE_NOTHING;


    _src.set(_this, '');

    var innerAudioContext = wx.createInnerAudioContext();

    _innerAudioContext.set(_this, innerAudioContext);

    innerAudioContext.onCanplay(function () {
      _this.dispatchEvent({ type: 'load' });
      _this.dispatchEvent({ type: 'loadend' });
      _this.dispatchEvent({ type: 'canplay' });
      _this.dispatchEvent({ type: 'canplaythrough' });
      _this.dispatchEvent({ type: 'loadedmetadata' });
      _this.readyState = HAVE_CURRENT_DATA;
    });
    innerAudioContext.onPlay(function () {
      _this._paused = _innerAudioContext.get(_this).paused;
      _this.dispatchEvent({ type: 'play' });
    });
    innerAudioContext.onPause(function () {
      _this._paused = _innerAudioContext.get(_this).paused;
      _this.dispatchEvent({ type: 'pause' });
    });
    innerAudioContext.onEnded(function () {
      _this._paused = _innerAudioContext.get(_this).paused;
      if (_innerAudioContext.get(_this).loop === false) {
        _this.dispatchEvent({ type: 'ended' });
      }
      _this.readyState = HAVE_ENOUGH_DATA;
    });
    innerAudioContext.onError(function () {
      _this._paused = _innerAudioContext.get(_this).paused;
      _this.dispatchEvent({ type: 'error' });
    });

    if (url) {
      _innerAudioContext.get(_this).src = url;
    }
    _this._paused = innerAudioContext.paused;
    _this._volume = innerAudioContext.volume;
    _this._muted = false;
    return _this;
  }

  _createClass(Audio, [{
    key: 'load',
    value: function load() {
      console.warn('HTMLAudioElement.load() is not implemented.');
    }
  }, {
    key: 'play',
    value: function play() {
      _innerAudioContext.get(this).play();
    }
  }, {
    key: 'pause',
    value: function pause() {
      _innerAudioContext.get(this).pause();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      _innerAudioContext.get(this).destroy();
    }
  }, {
    key: 'canPlayType',
    value: function canPlayType() {
      var mediaType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      if (typeof mediaType !== 'string') {
        return '';
      }

      if (mediaType.indexOf('audio/mpeg') > -1 || mediaType.indexOf('audio/mp4')) {
        return 'probably';
      }
      return '';
    }
  }, {
    key: 'cloneNode',
    value: function cloneNode() {
      var newAudio = new Audio();
      newAudio.loop = _innerAudioContext.get(this).loop;
      newAudio.autoplay = _innerAudioContext.get(this).autoplay;
      newAudio.src = this.src;
      return newAudio;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return _innerAudioContext.get(this).currentTime;
    },
    set: function set(value) {
      _innerAudioContext.get(this).seek(value);
    }
  }, {
    key: 'duration',
    get: function get() {
      return _innerAudioContext.get(this).duration;
    }
  }, {
    key: 'src',
    get: function get() {
      return _src.get(this);
    },
    set: function set(value) {
      _src.set(this, value);
      _innerAudioContext.get(this).src = value;
    }
  }, {
    key: 'loop',
    get: function get() {
      return _innerAudioContext.get(this).loop;
    },
    set: function set(value) {
      _innerAudioContext.get(this).loop = value;
    }
  }, {
    key: 'autoplay',
    get: function get() {
      return _innerAudioContext.get(this).autoplay;
    },
    set: function set(value) {
      _innerAudioContext.get(this).autoplay = value;
    }
  }, {
    key: 'paused',
    get: function get() {
      return this._paused;
    }
  }, {
    key: 'volume',
    get: function get() {
      return this._volume;
    },
    set: function set(value) {
      this._volume = value;
      if (!this._muted) {
        _innerAudioContext.get(this).volume = value;
      }
    }
  }, {
    key: 'muted',
    get: function get() {
      return this._muted;
    },
    set: function set(value) {
      this._muted = value;
      if (value) {
        _innerAudioContext.get(this).volume = 0;
      } else {
        _innerAudioContext.get(this).volume = this._volume;
      }
    }
  }]);

  return Audio;
}(_HTMLAudioElement3.default);

exports.default = Audio;
module.exports = exports['default'];