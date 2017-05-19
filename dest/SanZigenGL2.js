(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @api private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {Mixed} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Boolean} exists Only check if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Remove the listeners of a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {Mixed} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
         listeners.fn === fn
      && (!once || listeners.once)
      && (!context || listeners.context === context)
    ) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
           listeners[i].fn !== fn
        || (once && !listeners[i].once)
        || (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {String|Symbol} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],2:[function(require,module,exports){
module.exports = function(strings) {
  if (typeof strings === 'string') strings = [strings]
  var exprs = [].slice.call(arguments,1)
  var parts = []
  for (var i = 0; i < strings.length-1; i++) {
    parts.push(strings[i], exprs[i] || '')
  }
  parts.push(strings[i])
  return parts.join('')
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PerspectiveCamera = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Matrix = require('../math/Matrix4');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// perspective camera
var PerspectiveCamera = function () {
    function PerspectiveCamera() {
        _classCallCheck(this, PerspectiveCamera);

        this.projectionMatrix = new _Matrix.Matrix4();
    }

    _createClass(PerspectiveCamera, [{
        key: 'setProjectionMatrix',
        value: function setProjectionMatrix(fov, aspect, near, far) {
            this.near = near;this.far = far;this.fov = fov;this.aspect = aspect;

            // let top =
        }
    }]);

    return PerspectiveCamera;
}();

exports.PerspectiveCamera = PerspectiveCamera;

},{"../math/Matrix4":14}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Attribute = exports.Attribute = function () {
    /**
     *
     * @param params = {gl : <webgl2Context>, itemSize : <int>, indexArray : <Boolean>, data : <Float32Array or Uint16Array>, name: <String>, program: <WebGLProgram>, usage: <usage(refer to https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData)> }
     */
    function Attribute(params) {
        _classCallCheck(this, Attribute);

        this.gl = params.gl;
        this.itemSize = params.itemSize;
        this.indexArray = !!params.indexArray;
        this.name = params.name;
        this.program = params.program;
        this.usage = params.usage || this.gl.STATIC_DRAW;
        // if(this.usage !== )
        this.transformFeedbackVarying = params.transformFeedbackVarying;

        if (!this.indexArray) {
            this.location = this.gl.getAttribLocation(this.program, this.name);
            this.type = params.type;

            if (_typeof(this.location) === -1) {
                console.error("[Attribute.js]: attribute " + this.name + " is not defined");
                return -1;
            }
        }

        this.buffer = this.gl.createBuffer();
        this.bindTarget = this.indexArray ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER;

        this.updateData(params.data);
    }

    _createClass(Attribute, [{
        key: "updateData",
        value: function updateData(data) {
            this.data = data;
            this.gl.bindBuffer(this.bindTarget, this.buffer);
            this.gl.bufferData(this.bindTarget, this.data, this.usage);
        }
    }, {
        key: "bind",
        value: function bind() {
            this.gl.bindBuffer(this.bindTarget, this.buffer);

            if (!this.indexArray) {
                this.gl.vertexAttribPointer(this.location, this.itemSize, this.gl.FLOAT, false, 0, 0);
                this.gl.enableVertexAttribArray(this.location);
            }

            return this;
        }
    }, {
        key: "findTransformFeedbackVaryingLocation",
        value: function findTransformFeedbackVaryingLocation(varyigInfoArray) {
            var _this = this;

            if (this.transformFeedbackVarying) {
                this.varyingLocation = varyigInfoArray.findIndex(function (varyigInfo) {
                    return varyigInfo.name === _this.transformFeedbackVarying;
                });
            } else {
                this.varyingLocation = -1;
            }

            return this;
        }
    }, {
        key: "bindBufferBase",
        value: function bindBufferBase() {
            if (this.varyingLocation >= 0) {
                this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, this.varyingLocation, this.buffer);
            }

            return this;
        }
    }]);

    return Attribute;
}();

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
// https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js
/**
 * @author alteredq / http://alteredqualia.com/
 */

function Clock(autoStart) {

	this.autoStart = autoStart !== undefined ? autoStart : true;

	this.startTime = 0;
	this.oldTime = 0;
	this.elapsedTime = 0;

	this.running = false;
}

Object.assign(Clock.prototype, {

	start: function start() {

		this.startTime = (typeof performance === 'undefined' ? Date : performance).now(); // see #10732

		this.oldTime = this.startTime;
		this.elapsedTime = 0;
		this.running = true;
	},

	stop: function stop() {

		this.getElapsedTime();
		this.running = false;
	},

	getElapsedTime: function getElapsedTime() {

		this.getDelta();
		return this.elapsedTime;
	},

	getDelta: function getDelta() {

		var diff = 0;

		if (this.autoStart && !this.running) {

			this.start();
			return 0;
		}

		if (this.running) {

			var newTime = (typeof performance === 'undefined' ? Date : performance).now();

			diff = (newTime - this.oldTime) / 1000;
			this.oldTime = newTime;

			this.elapsedTime += diff;
		}

		return diff;
	}

});

exports.Clock = Clock;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ProgramRenderer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WebGLProgram = require('../renderers/webgl/WebGLProgram');

var _Attribute = require('./Attribute');

var _Uniform = require('./Uniform');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('eventemitter3');

var ProgramRenderer = exports.ProgramRenderer = function (_EventEmitter) {
    _inherits(ProgramRenderer, _EventEmitter);

    function ProgramRenderer() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, ProgramRenderer);

        var _this = _possibleConstructorReturn(this, (ProgramRenderer.__proto__ || Object.getPrototypeOf(ProgramRenderer)).call(this));

        if (!params.renderer) console.error('params.rendere is not defined. ' + params.renderer);

        _this.renderer = params.renderer;
        _this.gl = _this.renderer.gl;
        _this.currentSourceIdx = 0;

        _this.webGLProgram = new _WebGLProgram.WebGLProgram({
            gl: _this.gl,
            vertexShaderSource: params.vertexShaderSource,
            fragmentShaderSource: params.fragmentShaderSource,
            transformFeedbackVaryingArray: params.transformFeedbackVaryingArray
        });

        _this.varyigInfoArray = [];
        for (var ii = 0; ii < params.transformFeedbackVaryingArray.length; ii++) {
            var varingVariable = _this.gl.getTransformFeedbackVarying(_this.webGLProgram.program, ii);
            _this.varyigInfoArray.push(varingVariable);
        }

        _this._setUniforms();
        _this.initializeShape();
        return _this;
    }

    _createClass(ProgramRenderer, [{
        key: '_setUniforms',
        value: function _setUniforms() {
            var numberOfUniforms = this.webGLProgram.gl.getProgramParameter(this.webGLProgram.program, this.webGLProgram.gl.ACTIVE_UNIFORMS);

            this.webGLProgram.uniforms = {};

            for (var ii = 0; ii < numberOfUniforms; ii++) {
                var uniformInfo = this.webGLProgram.gl.getActiveUniform(this.webGLProgram.program, ii);
                var uniformLocation = this.webGLProgram.gl.getUniformLocation(this.webGLProgram.program, uniformInfo.name);
                this.webGLProgram.uniforms[uniformInfo.name] = new _Uniform.Uniform({
                    gl: this.webGLProgram.gl,
                    uniformInfo: uniformInfo,
                    uniformLocation: uniformLocation
                });
            }
        }
    }, {
        key: 'initializeShape',
        value: function initializeShape() {}
    }, {
        key: 'initializeVBOs',
        value: function initializeVBOs(attributes) {
            this.VAOs = [this.gl.createVertexArray(), this.gl.createVertexArray()];
            this.VBOs = [];
            console.log(attributes);

            for (var ii = 0; ii < this.VAOs.length; ii++) {
                this.VBOs[ii] = {};

                this.gl.bindVertexArray(this.VAOs[ii]);

                for (var key in attributes) {
                    this.VBOs[ii][key] = new _Attribute.Attribute({
                        gl: this.gl,
                        usage: attributes[key].indexArray ? this.gl.STATIC_DRAW : this.gl.STREAM_COPY,
                        itemSize: attributes[key].itemSize,
                        name: attributes[key].name,
                        indexArray: attributes[key].indexArray,
                        data: attributes[key].data,
                        program: this.webGLProgram.program,
                        transformFeedbackVarying: attributes[key].transformFeedbackVarying
                    });
                    this.VBOs[ii][key].bind();
                    this.VBOs[ii][key].findTransformFeedbackVaryingLocation(this.varyigInfoArray);
                }
            }
        }
    }, {
        key: 'initializeTransformFeedback',
        value: function initializeTransformFeedback() {
            this.transformFeedback = this.webGLProgram.gl.createTransformFeedback();
        }
    }, {
        key: 'useProgram',
        value: function useProgram() {
            this.gl.useProgram(this.webGLProgram.program);
            return this;
        }
    }, {
        key: 'bindTransformFeedback',
        value: function bindTransformFeedback() {
            if (this.transformFeedback) this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.transformFeedback);
            return this;
        }
    }, {
        key: 'updateVAO',
        value: function updateVAO() {
            var sourceVAO = this.VAOs[this.currentSourceIdx];
            this.gl.bindVertexArray(sourceVAO);
        }
    }, {
        key: 'updateVBO',
        value: function updateVBO() {
            this.currentSourceIdx = (this.currentSourceIdx + 1) % 2;
            var destVBOs = this.VBOs[this.currentSourceIdx];

            for (var key in destVBOs) {
                destVBOs[key].bindBufferBase();
            }

            return this;
        }
    }, {
        key: 'update',
        value: function update() {
            return this;
        }
    }, {
        key: 'beginTransformFeedback',
        value: function beginTransformFeedback() {
            var primitiveMode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.gl.POINTS;

            this.gl.beginTransformFeedback(primitiveMode);
            return this;
        }
    }, {
        key: 'draw',
        value: function draw() {
            return this;
        }
    }, {
        key: 'endTransformFeedback',
        value: function endTransformFeedback() {
            this.gl.endTransformFeedback();
            return this;
        }
    }]);

    return ProgramRenderer;
}(EventEmitter);

},{"../renderers/webgl/WebGLProgram":19,"./Attribute":4,"./Uniform":8,"eventemitter3":1}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//referred code
// https://github.com/kenjiSpecial/three.js/blob/dev/examples/js/postprocessing/EffectComposer.js

var TransformFeedback = exports.TransformFeedback = function () {
    function TransformFeedback(params) {
        _classCallCheck(this, TransformFeedback);

        this.gl = params.gl;
        this.program = params.program;
        this.name = params.name;
        this.data = new Float32Array(params.data);

        this.location = this.gl.getAttribLocation(this.program, this.name);
        if (this.location === -1) {
            console.error("Attribute " + this.name + " is not found.");
            return;
        }

        this.bufferA = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferA);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.data, this.gl.DYNAMIC_COPY);

        this.bufferB = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferA);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.data.length * Float32Array.BYTES_PER_ELEMENT, this.gl.DYNAMIC_COPY);

        this.transformFeedback = this.gl.createTransformFeedback();

        this.readBuffer = this.bufferA;
        this.writeBuffer = this.bufferB;
    }

    _createClass(TransformFeedback, [{
        key: "bind",
        value: function bind() {
            this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.transformFeedback);
        }
    }, {
        key: "swap",
        value: function swap() {
            var temp = this.readBuffer;
            this.readBuffer = this.writeBuffer;
            this.readBuffer = temp;
        }
    }]);

    return TransformFeedback;
}();

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Uniform = exports.Uniform = function () {
    function Uniform(params) {
        _classCallCheck(this, Uniform);

        this.uniformInfo = params.uniformInfo;
        this.name = this.uniformInfo.name;
        if (params.uniformHandle) {
            console.warn('[Uniform.js]: params.uniformHandle is not used anymore. use params.uniformLocation');
        }
        this.uniformLocation = params.uniformLocation;
        this.gl = params.gl;

        var UniformClass = void 0;
        var uniformCount = void 0;
        var gl = this.gl;
        switch (this.uniformInfo.type) {
            case gl.INT:
            case gl.BOOL:
            case gl.SAMPLER_2D:
            case gl.SAMPLER_CUBE:
                UniformClass = "Int";
                uniformCount = 1;
                break;
            case gl.FLOAT:
                UniformClass = "Float";
                uniformCount = 1;
                break;
            case gl.FLOAT_VEC2:
                UniformClass = "FloatVec2";
                uniformCount = 2;
                break;
            case gl.FLOAT_VEC3:
                UniformClass = "FloatVec3";
                uniformCount = 3;
                break;
            case gl.FLOAT_VEC4:
                UniformClass = "FloatVec4";
                uniformCount = 4;
                break;
            case gl.INT_VEC2:
                UniformClass = "IntVec2";
                uniformCount = 2;
                break;
            case gl.INT_VEC3:
                UniformClass = "IntVec3";
                uniformCount = 3;
                break;
            case gl.INT_VEC4:
                UniformClass = "IntVec4";
                uniformCount = 4;
                break;
            case gl.BOOL_VEC2:
                UniformClass = "BoolVec2";
                uniformCount = 2;
                break;
            case gl.BOOL_VEC3:
                UniformClass = "BoolVec3";
                uniformCount = 3;
                break;
            case gl.BOOL_VEC4:
                UniformClass = "BoolVec4";
                uniformCount = 4;
                break;
            case gl.FLOAT_MAT2:
                UniformClass = "Mat2";
                uniformCount = 4;
                break;
            case gl.FLOAT_MAT3:
                UniformClass = "Mat3";
                uniformCount = 9;
                break;
            case gl.FLOAT_MAT4:
                UniformClass = "Mat4";
                uniformCount = 16;
                break;
            default:
                console.error("Unrecognized type for uniform ", uniformInfo.name);
                break;
        }

        this.UniformClass = UniformClass;
        this.uniformCount = uniformCount;
    }

    _createClass(Uniform, [{
        key: "set1f",
        value: function set1f(value0) {
            if (this.cache === value0) return;

            this.cache = value0;
            this.gl.uniform1f(this.uniformLocation, value0);
        }
    }, {
        key: "set2f",
        value: function set2f(value0, value1) {
            if (this.cache && this.cache.x === value0 && this.cache.y === value1) return;

            this.cache = { x: value0, y: value1 };
            this.gl.uniform2f(this.uniformLocation, value0, value1);
        }
    }, {
        key: "set3f",
        value: function set3f(value0, value1, value2) {
            if (this.cache && this.cache.x === value0 && this.cache.y === value1 && this.cache.z === value2) return;

            this.cache = { x: value0, y: value1, z: value2 };
            this.gl.uniform3f(this.uniformLocation, value0, value1, value2);
        }
    }, {
        key: "set4f",
        value: function set4f(value0, value1, value2, value3) {
            if (this.cache && this.cache.x === value0 && this.cache.y === value1 && this.cache.z === value2 && this.cache.w === value3) return;

            this.cache = { x: value0, y: value1, z: value2, w: value3 };
            this.gl.uniform4f(this.uniformLocation, value0, value1, value2, value3);
        }
    }, {
        key: "setMatrix",
        value: function setMatrix(arrVal) {
            if (arrVal.length !== 4 && arrVal.length !== 9 && arrVal.length !== 16) {
                console.error("we don't support: array length " + arrVal.length);
                return;
            }
            if (this.cache === arrVal) return;

            this.cache = arrVal;

            if (arrVal.length === 4) {
                this.gl.uniformMatrix2fv(this.uniformLocation, false, arrVal);
            } else if (arrVal.length === 9) {
                this.gl.uniformMatrix3fv(this.uniformLocation, false, arrVal);
            } else if (arrVal.length === 16) {
                this.gl.uniformMatrix4fv(this.uniformLocation, false, arrVal);
            }
        }
    }, {
        key: "setMatrix4",
        value: function setMatrix4(arrVal) {
            if (arrVal.length !== 16) {
                console.error("we need 16 items in array. we don't support: array length " + arrVal.length);
                return;
            }

            if (this.cache === arrVal) return;
            this.cache = arrVal;

            this.gl.uniformMatrix4fv(this.uniformLocation, false, arrVal);
        }
    }, {
        key: "setMatrix3",
        value: function setMatrix3(arrVal) {
            if (arrVal.length !== 9) {
                console.error("we need 9 items in array. we don't support: array length " + arrVal.length);
                return;
            }

            if (this.cache === arrVal) return;
            this.cache = arrVal;

            this.gl.uniformMatrix3fv(this.uniformLocation, false, arrVal);
        }
    }, {
        key: "setMatrix2",
        value: function setMatrix2(arrVal) {
            if (arrVal.length !== 4) {
                console.error("we need 4 items in array. we don't support: array length " + arrVal.length);
                return;
            }

            if (this.cache === arrVal) return;
            this.cache = arrVal;

            this.gl.uniformMatrix2fv(this.uniformLocation, false, arrVal);
        }
    }, {
        key: "set",
        value: function set(value) {
            console.log(arguments.length);
            if (this.cache === value) return;

            if (this.uniformCount === 1) {
                this.gl.uniform1f(this.uniformLocation, value);
            } else if (this.uniformCount === 2) {
                if (Array.isArray(value)) {
                    this.gl.uniform2fv(this.uniformLocation, value);
                } else {
                    this.gl.uniform2f(this.uniformLocation, value.x, value.y);
                }
            } else if (this.uniformCount === 3) {
                if (Array.isArray(value)) {
                    this.gl.uniform3fv(this.uniformLocation, value);
                } else {
                    this.gl.uniform3f(this.uniformLocation, value.x, value.y, value.z);
                }
            } else if (this.uniformCount === 4) {
                if (Array.isArray(value)) {
                    this.gl.uniform4fv(thihs.uniformLocation, value);
                } else {
                    this.gl.uniform4f(thihs.uniformLocation, value.x, value.y, value.z, value.w);
                }
            } else {
                console.error("make method for uniformCount:" + this.uniformCount);
            }
        }
    }]);

    return Uniform;
}();

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _WebGLRenderer = require('./renderers/WebGLRenderer');

Object.defineProperty(exports, 'WebGLRenderer', {
  enumerable: true,
  get: function get() {
    return _WebGLRenderer.WebGLRenderer;
  }
});

var _WebGLShader = require('./renderers/webgl/WebGLShader');

Object.defineProperty(exports, 'webGLShader', {
  enumerable: true,
  get: function get() {
    return _WebGLShader.webGLShader;
  }
});

var _WebGLProgram = require('./renderers/webgl/WebGLProgram');

Object.defineProperty(exports, 'WebGLProgram', {
  enumerable: true,
  get: function get() {
    return _WebGLProgram.WebGLProgram;
  }
});

var _TransformFeedback = require('./core/TransformFeedback');

Object.defineProperty(exports, 'TransformFeedback', {
  enumerable: true,
  get: function get() {
    return _TransformFeedback.TransformFeedback;
  }
});

var _Uniform = require('./core/Uniform');

Object.defineProperty(exports, 'Uniform', {
  enumerable: true,
  get: function get() {
    return _Uniform.Uniform;
  }
});

var _ProgramRenderer = require('./core/ProgramRenderer');

Object.defineProperty(exports, 'ProgramRenderer', {
  enumerable: true,
  get: function get() {
    return _ProgramRenderer.ProgramRenderer;
  }
});

var _Attribute = require('./core/Attribute');

Object.defineProperty(exports, 'Attribute', {
  enumerable: true,
  get: function get() {
    return _Attribute.Attribute;
  }
});

var _Clock = require('./core/Clock');

Object.defineProperty(exports, 'Clock', {
  enumerable: true,
  get: function get() {
    return _Clock.Clock;
  }
});

var _Math2 = require('./math/Math');

Object.defineProperty(exports, 'Math', {
  enumerable: true,
  get: function get() {
    return _Math2._Math;
  }
});

var _Vector = require('./math/Vector2');

Object.defineProperty(exports, 'Vector2', {
  enumerable: true,
  get: function get() {
    return _Vector.Vector2;
  }
});

var _Vector2 = require('./math/Vector3');

Object.defineProperty(exports, 'Vector3', {
  enumerable: true,
  get: function get() {
    return _Vector2.Vector3;
  }
});

var _Matrix = require('./math/Matrix4');

Object.defineProperty(exports, 'Matrix4', {
  enumerable: true,
  get: function get() {
    return _Matrix.Matrix4;
  }
});

var _Shape = require('./shape/Shape');

Object.defineProperty(exports, 'Shape', {
  enumerable: true,
  get: function get() {
    return _Shape.Shape;
  }
});

var _Triangle = require('./shape/Triangle');

Object.defineProperty(exports, 'Triangle', {
  enumerable: true,
  get: function get() {
    return _Triangle.Triangle;
  }
});

var _Circle = require('./shape/Circle');

Object.defineProperty(exports, 'Circle', {
  enumerable: true,
  get: function get() {
    return _Circle.Circle;
  }
});

var _Rectangle = require('./shape/Rectangle');

Object.defineProperty(exports, 'Rectangle', {
  enumerable: true,
  get: function get() {
    return _Rectangle.Rectangle;
  }
});

var _Box = require('./shape/Box');

Object.defineProperty(exports, 'Box', {
  enumerable: true,
  get: function get() {
    return _Box.Box;
  }
});

},{"./core/Attribute":4,"./core/Clock":5,"./core/ProgramRenderer":6,"./core/TransformFeedback":7,"./core/Uniform":8,"./math/Math":13,"./math/Matrix4":14,"./math/Vector2":16,"./math/Vector3":17,"./renderers/WebGLRenderer":18,"./renderers/webgl/WebGLProgram":19,"./renderers/webgl/WebGLShader":20,"./shape/Box":21,"./shape/Circle":22,"./shape/Rectangle":23,"./shape/Shape":24,"./shape/Triangle":25}],10:[function(require,module,exports){
'use strict';

window.San = require('./index');

},{"./index":9}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.Color = undefined;

var _Math2 = require('./Math');

/**
 * @author mrdoob / http://mrdoob.com/
 */

function Color(r, g, b) {

		if (g === undefined && b === undefined) {

				// r is THREE.Color, hex or string
				return this.set(r);
		}

		return this.setRGB(r, g, b);
}

Color.prototype = {

		constructor: Color,

		isColor: true,

		r: 1, g: 1, b: 1,

		set: function set(value) {

				if (value && value.isColor) {

						this.copy(value);
				} else if (typeof value === 'number') {

						this.setHex(value);
				} else if (typeof value === 'string') {

						this.setStyle(value);
				}

				return this;
		},

		setScalar: function setScalar(scalar) {

				this.r = scalar;
				this.g = scalar;
				this.b = scalar;

				return this;
		},

		setHex: function setHex(hex) {

				hex = Math.floor(hex);

				this.r = (hex >> 16 & 255) / 255;
				this.g = (hex >> 8 & 255) / 255;
				this.b = (hex & 255) / 255;

				return this;
		},

		setRGB: function setRGB(r, g, b) {

				this.r = r;
				this.g = g;
				this.b = b;

				return this;
		},

		setHSL: function () {

				function hue2rgb(p, q, t) {

						if (t < 0) t += 1;
						if (t > 1) t -= 1;
						if (t < 1 / 6) return p + (q - p) * 6 * t;
						if (t < 1 / 2) return q;
						if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
						return p;
				}

				return function setHSL(h, s, l) {

						// h,s,l ranges are in 0.0 - 1.0
						h = _Math2._Math.euclideanModulo(h, 1);
						s = _Math2._Math.clamp(s, 0, 1);
						l = _Math2._Math.clamp(l, 0, 1);

						if (s === 0) {

								this.r = this.g = this.b = l;
						} else {

								var p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
								var q = 2 * l - p;

								this.r = hue2rgb(q, p, h + 1 / 3);
								this.g = hue2rgb(q, p, h);
								this.b = hue2rgb(q, p, h - 1 / 3);
						}

						return this;
				};
		}(),

		setStyle: function setStyle(style) {

				function handleAlpha(string) {

						if (string === undefined) return;

						if (parseFloat(string) < 1) {

								console.warn('THREE.Color: Alpha component of ' + style + ' will be ignored.');
						}
				}

				var m;

				if (m = /^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/.exec(style)) {

						// rgb / hsl

						var color;
						var name = m[1];
						var components = m[2];

						switch (name) {

								case 'rgb':
								case 'rgba':

										if (color = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {

												// rgb(255,0,0) rgba(255,0,0,0.5)
												this.r = Math.min(255, parseInt(color[1], 10)) / 255;
												this.g = Math.min(255, parseInt(color[2], 10)) / 255;
												this.b = Math.min(255, parseInt(color[3], 10)) / 255;

												handleAlpha(color[5]);

												return this;
										}

										if (color = /^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {

												// rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)
												this.r = Math.min(100, parseInt(color[1], 10)) / 100;
												this.g = Math.min(100, parseInt(color[2], 10)) / 100;
												this.b = Math.min(100, parseInt(color[3], 10)) / 100;

												handleAlpha(color[5]);

												return this;
										}

										break;

								case 'hsl':
								case 'hsla':

										if (color = /^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {

												// hsl(120,50%,50%) hsla(120,50%,50%,0.5)
												var h = parseFloat(color[1]) / 360;
												var s = parseInt(color[2], 10) / 100;
												var l = parseInt(color[3], 10) / 100;

												handleAlpha(color[5]);

												return this.setHSL(h, s, l);
										}

										break;

						}
				} else if (m = /^\#([A-Fa-f0-9]+)$/.exec(style)) {

						// hex color

						var hex = m[1];
						var size = hex.length;

						if (size === 3) {

								// #ff0
								this.r = parseInt(hex.charAt(0) + hex.charAt(0), 16) / 255;
								this.g = parseInt(hex.charAt(1) + hex.charAt(1), 16) / 255;
								this.b = parseInt(hex.charAt(2) + hex.charAt(2), 16) / 255;

								return this;
						} else if (size === 6) {

								// #ff0000
								this.r = parseInt(hex.charAt(0) + hex.charAt(1), 16) / 255;
								this.g = parseInt(hex.charAt(2) + hex.charAt(3), 16) / 255;
								this.b = parseInt(hex.charAt(4) + hex.charAt(5), 16) / 255;

								return this;
						}
				}

				if (style && style.length > 0) {

						// color keywords
						var hex = ColorKeywords[style];

						if (hex !== undefined) {

								// red
								this.setHex(hex);
						} else {

								// unknown color
								console.warn('THREE.Color: Unknown color ' + style);
						}
				}

				return this;
		},

		clone: function clone() {

				return new this.constructor(this.r, this.g, this.b);
		},

		copy: function copy(color) {

				this.r = color.r;
				this.g = color.g;
				this.b = color.b;

				return this;
		},

		copyGammaToLinear: function copyGammaToLinear(color, gammaFactor) {

				if (gammaFactor === undefined) gammaFactor = 2.0;

				this.r = Math.pow(color.r, gammaFactor);
				this.g = Math.pow(color.g, gammaFactor);
				this.b = Math.pow(color.b, gammaFactor);

				return this;
		},

		copyLinearToGamma: function copyLinearToGamma(color, gammaFactor) {

				if (gammaFactor === undefined) gammaFactor = 2.0;

				var safeInverse = gammaFactor > 0 ? 1.0 / gammaFactor : 1.0;

				this.r = Math.pow(color.r, safeInverse);
				this.g = Math.pow(color.g, safeInverse);
				this.b = Math.pow(color.b, safeInverse);

				return this;
		},

		convertGammaToLinear: function convertGammaToLinear() {

				var r = this.r,
				    g = this.g,
				    b = this.b;

				this.r = r * r;
				this.g = g * g;
				this.b = b * b;

				return this;
		},

		convertLinearToGamma: function convertLinearToGamma() {

				this.r = Math.sqrt(this.r);
				this.g = Math.sqrt(this.g);
				this.b = Math.sqrt(this.b);

				return this;
		},

		getHex: function getHex() {

				return this.r * 255 << 16 ^ this.g * 255 << 8 ^ this.b * 255 << 0;
		},

		getHexString: function getHexString() {

				return ('000000' + this.getHex().toString(16)).slice(-6);
		},

		getHSL: function getHSL(optionalTarget) {

				// h,s,l ranges are in 0.0 - 1.0

				var hsl = optionalTarget || { h: 0, s: 0, l: 0 };

				var r = this.r,
				    g = this.g,
				    b = this.b;

				var max = Math.max(r, g, b);
				var min = Math.min(r, g, b);

				var hue, saturation;
				var lightness = (min + max) / 2.0;

				if (min === max) {

						hue = 0;
						saturation = 0;
				} else {

						var delta = max - min;

						saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);

						switch (max) {

								case r:
										hue = (g - b) / delta + (g < b ? 6 : 0);break;
								case g:
										hue = (b - r) / delta + 2;break;
								case b:
										hue = (r - g) / delta + 4;break;

						}

						hue /= 6;
				}

				hsl.h = hue;
				hsl.s = saturation;
				hsl.l = lightness;

				return hsl;
		},

		getStyle: function getStyle() {

				return 'rgb(' + (this.r * 255 | 0) + ',' + (this.g * 255 | 0) + ',' + (this.b * 255 | 0) + ')';
		},

		offsetHSL: function offsetHSL(h, s, l) {

				var hsl = this.getHSL();

				hsl.h += h;hsl.s += s;hsl.l += l;

				this.setHSL(hsl.h, hsl.s, hsl.l);

				return this;
		},

		add: function add(color) {

				this.r += color.r;
				this.g += color.g;
				this.b += color.b;

				return this;
		},

		addColors: function addColors(color1, color2) {

				this.r = color1.r + color2.r;
				this.g = color1.g + color2.g;
				this.b = color1.b + color2.b;

				return this;
		},

		addScalar: function addScalar(s) {

				this.r += s;
				this.g += s;
				this.b += s;

				return this;
		},

		sub: function sub(color) {

				this.r = Math.max(0, this.r - color.r);
				this.g = Math.max(0, this.g - color.g);
				this.b = Math.max(0, this.b - color.b);

				return this;
		},

		multiply: function multiply(color) {

				this.r *= color.r;
				this.g *= color.g;
				this.b *= color.b;

				return this;
		},

		multiplyScalar: function multiplyScalar(s) {

				this.r *= s;
				this.g *= s;
				this.b *= s;

				return this;
		},

		lerp: function lerp(color, alpha) {

				this.r += (color.r - this.r) * alpha;
				this.g += (color.g - this.g) * alpha;
				this.b += (color.b - this.b) * alpha;

				return this;
		},

		equals: function equals(c) {

				return c.r === this.r && c.g === this.g && c.b === this.b;
		},

		fromArray: function fromArray(array, offset) {

				if (offset === undefined) offset = 0;

				this.r = array[offset];
				this.g = array[offset + 1];
				this.b = array[offset + 2];

				return this;
		},

		toArray: function toArray(array, offset) {

				if (array === undefined) array = [];
				if (offset === undefined) offset = 0;

				array[offset] = this.r;
				array[offset + 1] = this.g;
				array[offset + 2] = this.b;

				return array;
		},

		toJSON: function toJSON() {

				return this.getHex();
		}

};

var ColorKeywords = { 'aliceblue': 0xF0F8FF, 'antiquewhite': 0xFAEBD7, 'aqua': 0x00FFFF, 'aquamarine': 0x7FFFD4, 'azure': 0xF0FFFF,
		'beige': 0xF5F5DC, 'bisque': 0xFFE4C4, 'black': 0x000000, 'blanchedalmond': 0xFFEBCD, 'blue': 0x0000FF, 'blueviolet': 0x8A2BE2,
		'brown': 0xA52A2A, 'burlywood': 0xDEB887, 'cadetblue': 0x5F9EA0, 'chartreuse': 0x7FFF00, 'chocolate': 0xD2691E, 'coral': 0xFF7F50,
		'cornflowerblue': 0x6495ED, 'cornsilk': 0xFFF8DC, 'crimson': 0xDC143C, 'cyan': 0x00FFFF, 'darkblue': 0x00008B, 'darkcyan': 0x008B8B,
		'darkgoldenrod': 0xB8860B, 'darkgray': 0xA9A9A9, 'darkgreen': 0x006400, 'darkgrey': 0xA9A9A9, 'darkkhaki': 0xBDB76B, 'darkmagenta': 0x8B008B,
		'darkolivegreen': 0x556B2F, 'darkorange': 0xFF8C00, 'darkorchid': 0x9932CC, 'darkred': 0x8B0000, 'darksalmon': 0xE9967A, 'darkseagreen': 0x8FBC8F,
		'darkslateblue': 0x483D8B, 'darkslategray': 0x2F4F4F, 'darkslategrey': 0x2F4F4F, 'darkturquoise': 0x00CED1, 'darkviolet': 0x9400D3,
		'deeppink': 0xFF1493, 'deepskyblue': 0x00BFFF, 'dimgray': 0x696969, 'dimgrey': 0x696969, 'dodgerblue': 0x1E90FF, 'firebrick': 0xB22222,
		'floralwhite': 0xFFFAF0, 'forestgreen': 0x228B22, 'fuchsia': 0xFF00FF, 'gainsboro': 0xDCDCDC, 'ghostwhite': 0xF8F8FF, 'gold': 0xFFD700,
		'goldenrod': 0xDAA520, 'gray': 0x808080, 'green': 0x008000, 'greenyellow': 0xADFF2F, 'grey': 0x808080, 'honeydew': 0xF0FFF0, 'hotpink': 0xFF69B4,
		'indianred': 0xCD5C5C, 'indigo': 0x4B0082, 'ivory': 0xFFFFF0, 'khaki': 0xF0E68C, 'lavender': 0xE6E6FA, 'lavenderblush': 0xFFF0F5, 'lawngreen': 0x7CFC00,
		'lemonchiffon': 0xFFFACD, 'lightblue': 0xADD8E6, 'lightcoral': 0xF08080, 'lightcyan': 0xE0FFFF, 'lightgoldenrodyellow': 0xFAFAD2, 'lightgray': 0xD3D3D3,
		'lightgreen': 0x90EE90, 'lightgrey': 0xD3D3D3, 'lightpink': 0xFFB6C1, 'lightsalmon': 0xFFA07A, 'lightseagreen': 0x20B2AA, 'lightskyblue': 0x87CEFA,
		'lightslategray': 0x778899, 'lightslategrey': 0x778899, 'lightsteelblue': 0xB0C4DE, 'lightyellow': 0xFFFFE0, 'lime': 0x00FF00, 'limegreen': 0x32CD32,
		'linen': 0xFAF0E6, 'magenta': 0xFF00FF, 'maroon': 0x800000, 'mediumaquamarine': 0x66CDAA, 'mediumblue': 0x0000CD, 'mediumorchid': 0xBA55D3,
		'mediumpurple': 0x9370DB, 'mediumseagreen': 0x3CB371, 'mediumslateblue': 0x7B68EE, 'mediumspringgreen': 0x00FA9A, 'mediumturquoise': 0x48D1CC,
		'mediumvioletred': 0xC71585, 'midnightblue': 0x191970, 'mintcream': 0xF5FFFA, 'mistyrose': 0xFFE4E1, 'moccasin': 0xFFE4B5, 'navajowhite': 0xFFDEAD,
		'navy': 0x000080, 'oldlace': 0xFDF5E6, 'olive': 0x808000, 'olivedrab': 0x6B8E23, 'orange': 0xFFA500, 'orangered': 0xFF4500, 'orchid': 0xDA70D6,
		'palegoldenrod': 0xEEE8AA, 'palegreen': 0x98FB98, 'paleturquoise': 0xAFEEEE, 'palevioletred': 0xDB7093, 'papayawhip': 0xFFEFD5, 'peachpuff': 0xFFDAB9,
		'peru': 0xCD853F, 'pink': 0xFFC0CB, 'plum': 0xDDA0DD, 'powderblue': 0xB0E0E6, 'purple': 0x800080, 'red': 0xFF0000, 'rosybrown': 0xBC8F8F,
		'royalblue': 0x4169E1, 'saddlebrown': 0x8B4513, 'salmon': 0xFA8072, 'sandybrown': 0xF4A460, 'seagreen': 0x2E8B57, 'seashell': 0xFFF5EE,
		'sienna': 0xA0522D, 'silver': 0xC0C0C0, 'skyblue': 0x87CEEB, 'slateblue': 0x6A5ACD, 'slategray': 0x708090, 'slategrey': 0x708090, 'snow': 0xFFFAFA,
		'springgreen': 0x00FF7F, 'steelblue': 0x4682B4, 'tan': 0xD2B48C, 'teal': 0x008080, 'thistle': 0xD8BFD8, 'tomato': 0xFF6347, 'turquoise': 0x40E0D0,
		'violet': 0xEE82EE, 'wheat': 0xF5DEB3, 'white': 0xFFFFFF, 'whitesmoke': 0xF5F5F5, 'yellow': 0xFFFF00, 'yellowgreen': 0x9ACD32 };

exports.Color = Color;

},{"./Math":13}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.Euler = undefined;

var _Quaternion = require('./Quaternion');

var _Vector = require('./Vector3');

var _Matrix = require('./Matrix4');

var _Math2 = require('./Math');

/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://clara.io
 */

function Euler(x, y, z, order) {

		this._x = x || 0;
		this._y = y || 0;
		this._z = z || 0;
		this._order = order || Euler.DefaultOrder;
}

Euler.RotationOrders = ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'];

Euler.DefaultOrder = 'XYZ';

Euler.prototype = {

		constructor: Euler,

		isEuler: true,

		get x() {

				return this._x;
		},

		set x(value) {

				this._x = value;
				this.onChangeCallback();
		},

		get y() {

				return this._y;
		},

		set y(value) {

				this._y = value;
				this.onChangeCallback();
		},

		get z() {

				return this._z;
		},

		set z(value) {

				this._z = value;
				this.onChangeCallback();
		},

		get order() {

				return this._order;
		},

		set order(value) {

				this._order = value;
				this.onChangeCallback();
		},

		set: function set(x, y, z, order) {

				this._x = x;
				this._y = y;
				this._z = z;
				this._order = order || this._order;

				this.onChangeCallback();

				return this;
		},

		clone: function clone() {

				return new this.constructor(this._x, this._y, this._z, this._order);
		},

		copy: function copy(euler) {

				this._x = euler._x;
				this._y = euler._y;
				this._z = euler._z;
				this._order = euler._order;

				this.onChangeCallback();

				return this;
		},

		setFromRotationMatrix: function setFromRotationMatrix(m, order, update) {

				var clamp = _Math2._Math.clamp;

				// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

				var te = m.elements;
				var m11 = te[0],
				    m12 = te[4],
				    m13 = te[8];
				var m21 = te[1],
				    m22 = te[5],
				    m23 = te[9];
				var m31 = te[2],
				    m32 = te[6],
				    m33 = te[10];

				order = order || this._order;

				if (order === 'XYZ') {

						this._y = Math.asin(clamp(m13, -1, 1));

						if (Math.abs(m13) < 0.99999) {

								this._x = Math.atan2(-m23, m33);
								this._z = Math.atan2(-m12, m11);
						} else {

								this._x = Math.atan2(m32, m22);
								this._z = 0;
						}
				} else if (order === 'YXZ') {

						this._x = Math.asin(-clamp(m23, -1, 1));

						if (Math.abs(m23) < 0.99999) {

								this._y = Math.atan2(m13, m33);
								this._z = Math.atan2(m21, m22);
						} else {

								this._y = Math.atan2(-m31, m11);
								this._z = 0;
						}
				} else if (order === 'ZXY') {

						this._x = Math.asin(clamp(m32, -1, 1));

						if (Math.abs(m32) < 0.99999) {

								this._y = Math.atan2(-m31, m33);
								this._z = Math.atan2(-m12, m22);
						} else {

								this._y = 0;
								this._z = Math.atan2(m21, m11);
						}
				} else if (order === 'ZYX') {

						this._y = Math.asin(-clamp(m31, -1, 1));

						if (Math.abs(m31) < 0.99999) {

								this._x = Math.atan2(m32, m33);
								this._z = Math.atan2(m21, m11);
						} else {

								this._x = 0;
								this._z = Math.atan2(-m12, m22);
						}
				} else if (order === 'YZX') {

						this._z = Math.asin(clamp(m21, -1, 1));

						if (Math.abs(m21) < 0.99999) {

								this._x = Math.atan2(-m23, m22);
								this._y = Math.atan2(-m31, m11);
						} else {

								this._x = 0;
								this._y = Math.atan2(m13, m33);
						}
				} else if (order === 'XZY') {

						this._z = Math.asin(-clamp(m12, -1, 1));

						if (Math.abs(m12) < 0.99999) {

								this._x = Math.atan2(m32, m22);
								this._y = Math.atan2(m13, m11);
						} else {

								this._x = Math.atan2(-m23, m33);
								this._y = 0;
						}
				} else {

						console.warn('THREE.Euler: .setFromRotationMatrix() given unsupported order: ' + order);
				}

				this._order = order;

				if (update !== false) this.onChangeCallback();

				return this;
		},

		setFromQuaternion: function () {

				var matrix;

				return function setFromQuaternion(q, order, update) {

						if (matrix === undefined) matrix = new _Matrix.Matrix4();

						matrix.makeRotationFromQuaternion(q);

						return this.setFromRotationMatrix(matrix, order, update);
				};
		}(),

		setFromVector3: function setFromVector3(v, order) {

				return this.set(v.x, v.y, v.z, order || this._order);
		},

		reorder: function () {

				// WARNING: this discards revolution information -bhouston

				var q = new _Quaternion.Quaternion();

				return function reorder(newOrder) {

						q.setFromEuler(this);

						return this.setFromQuaternion(q, newOrder);
				};
		}(),

		equals: function equals(euler) {

				return euler._x === this._x && euler._y === this._y && euler._z === this._z && euler._order === this._order;
		},

		fromArray: function fromArray(array) {

				this._x = array[0];
				this._y = array[1];
				this._z = array[2];
				if (array[3] !== undefined) this._order = array[3];

				this.onChangeCallback();

				return this;
		},

		toArray: function toArray(array, offset) {

				if (array === undefined) array = [];
				if (offset === undefined) offset = 0;

				array[offset] = this._x;
				array[offset + 1] = this._y;
				array[offset + 2] = this._z;
				array[offset + 3] = this._order;

				return array;
		},

		toVector3: function toVector3(optionalResult) {

				if (optionalResult) {

						return optionalResult.set(this._x, this._y, this._z);
				} else {

						return new _Vector.Vector3(this._x, this._y, this._z);
				}
		},

		onChange: function onChange(callback) {

				this.onChangeCallback = callback;

				return this;
		},

		onChangeCallback: function onChangeCallback() {}

};

exports.Euler = Euler;

},{"./Math":13,"./Matrix4":14,"./Quaternion":15,"./Vector3":17}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

var _Math = {

	DEG2RAD: Math.PI / 180,
	RAD2DEG: 180 / Math.PI,

	generateUUID: function () {

		// http://www.broofa.com/Tools/Math.uuid.htm

		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		var uuid = new Array(36);
		var rnd = 0,
		    r;

		return function generateUUID() {

			for (var i = 0; i < 36; i++) {

				if (i === 8 || i === 13 || i === 18 || i === 23) {

					uuid[i] = '-';
				} else if (i === 14) {

					uuid[i] = '4';
				} else {

					if (rnd <= 0x02) rnd = 0x2000000 + Math.random() * 0x1000000 | 0;
					r = rnd & 0xf;
					rnd = rnd >> 4;
					uuid[i] = chars[i === 19 ? r & 0x3 | 0x8 : r];
				}
			}

			return uuid.join('');
		};
	}(),

	clamp: function clamp(value, min, max) {

		return Math.max(min, Math.min(max, value));
	},

	// compute euclidian modulo of m % n
	// https://en.wikipedia.org/wiki/Modulo_operation

	euclideanModulo: function euclideanModulo(n, m) {

		return (n % m + m) % m;
	},

	// Linear mapping from range <a1, a2> to range <b1, b2>

	mapLinear: function mapLinear(x, a1, a2, b1, b2) {

		return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
	},

	// https://en.wikipedia.org/wiki/Linear_interpolation

	lerp: function lerp(x, y, t) {

		return (1 - t) * x + t * y;
	},

	// http://en.wikipedia.org/wiki/Smoothstep

	smoothstep: function smoothstep(x, min, max) {

		if (x <= min) return 0;
		if (x >= max) return 1;

		x = (x - min) / (max - min);

		return x * x * (3 - 2 * x);
	},

	smootherstep: function smootherstep(x, min, max) {

		if (x <= min) return 0;
		if (x >= max) return 1;

		x = (x - min) / (max - min);

		return x * x * x * (x * (x * 6 - 15) + 10);
	},

	// Random integer from <low, high> interval

	randInt: function randInt(low, high) {

		return low + Math.floor(Math.random() * (high - low + 1));
	},

	// Random float from <low, high> interval

	randFloat: function randFloat(low, high) {

		return low + Math.random() * (high - low);
	},

	// Random float from <-range/2, range/2> interval

	randFloatSpread: function randFloatSpread(range) {

		return range * (0.5 - Math.random());
	},

	degToRad: function degToRad(degrees) {

		return degrees * _Math.DEG2RAD;
	},

	radToDeg: function radToDeg(radians) {

		return radians * _Math.RAD2DEG;
	},

	isPowerOfTwo: function isPowerOfTwo(value) {

		return (value & value - 1) === 0 && value !== 0;
	},

	nearestPowerOfTwo: function nearestPowerOfTwo(value) {

		return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
	},

	nextPowerOfTwo: function nextPowerOfTwo(value) {

		value--;
		value |= value >> 1;
		value |= value >> 2;
		value |= value >> 4;
		value |= value >> 8;
		value |= value >> 16;
		value++;

		return value;
	}

};

exports._Math = _Math;

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.Matrix4 = undefined;

var _Math2 = require('./Math');

var _Vector = require('./Vector3');

/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author timknip / http://www.floorplanner.com/
 * @author bhouston / http://clara.io
 * @author WestLangley / http://github.com/WestLangley
 */

function Matrix4() {

		this.elements = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

		if (arguments.length > 0) {

				console.error('THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.');
		}
}

Matrix4.prototype = {

		constructor: Matrix4,

		isMatrix4: true,

		set: function set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {

				var te = this.elements;

				te[0] = n11;te[4] = n12;te[8] = n13;te[12] = n14;
				te[1] = n21;te[5] = n22;te[9] = n23;te[13] = n24;
				te[2] = n31;te[6] = n32;te[10] = n33;te[14] = n34;
				te[3] = n41;te[7] = n42;te[11] = n43;te[15] = n44;

				return this;
		},

		identity: function identity() {

				this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

				return this;
		},

		clone: function clone() {

				return new Matrix4().fromArray(this.elements);
		},

		copy: function copy(m) {

				this.elements.set(m.elements);

				return this;
		},

		copyPosition: function copyPosition(m) {

				var te = this.elements;
				var me = m.elements;

				te[12] = me[12];
				te[13] = me[13];
				te[14] = me[14];

				return this;
		},

		extractBasis: function extractBasis(xAxis, yAxis, zAxis) {

				xAxis.setFromMatrixColumn(this, 0);
				yAxis.setFromMatrixColumn(this, 1);
				zAxis.setFromMatrixColumn(this, 2);

				return this;
		},

		makeBasis: function makeBasis(xAxis, yAxis, zAxis) {

				this.set(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, 0, 0, 0, 1);

				return this;
		},

		extractRotation: function () {

				var v1;

				return function extractRotation(m) {

						if (v1 === undefined) v1 = new _Vector.Vector3();

						var te = this.elements;
						var me = m.elements;

						var scaleX = 1 / v1.setFromMatrixColumn(m, 0).length();
						var scaleY = 1 / v1.setFromMatrixColumn(m, 1).length();
						var scaleZ = 1 / v1.setFromMatrixColumn(m, 2).length();

						te[0] = me[0] * scaleX;
						te[1] = me[1] * scaleX;
						te[2] = me[2] * scaleX;

						te[4] = me[4] * scaleY;
						te[5] = me[5] * scaleY;
						te[6] = me[6] * scaleY;

						te[8] = me[8] * scaleZ;
						te[9] = me[9] * scaleZ;
						te[10] = me[10] * scaleZ;

						return this;
				};
		}(),

		makeRotationFromEuler: function makeRotationFromEuler(euler) {

				if ((euler && euler.isEuler) === false) {

						console.error('THREE.Matrix: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.');
				}

				var te = this.elements;

				var x = euler.x,
				    y = euler.y,
				    z = euler.z;
				var a = Math.cos(x),
				    b = Math.sin(x);
				var c = Math.cos(y),
				    d = Math.sin(y);
				var e = Math.cos(z),
				    f = Math.sin(z);

				if (euler.order === 'XYZ') {

						var ae = a * e,
						    af = a * f,
						    be = b * e,
						    bf = b * f;

						te[0] = c * e;
						te[4] = -c * f;
						te[8] = d;

						te[1] = af + be * d;
						te[5] = ae - bf * d;
						te[9] = -b * c;

						te[2] = bf - ae * d;
						te[6] = be + af * d;
						te[10] = a * c;
				} else if (euler.order === 'YXZ') {

						var ce = c * e,
						    cf = c * f,
						    de = d * e,
						    df = d * f;

						te[0] = ce + df * b;
						te[4] = de * b - cf;
						te[8] = a * d;

						te[1] = a * f;
						te[5] = a * e;
						te[9] = -b;

						te[2] = cf * b - de;
						te[6] = df + ce * b;
						te[10] = a * c;
				} else if (euler.order === 'ZXY') {

						var ce = c * e,
						    cf = c * f,
						    de = d * e,
						    df = d * f;

						te[0] = ce - df * b;
						te[4] = -a * f;
						te[8] = de + cf * b;

						te[1] = cf + de * b;
						te[5] = a * e;
						te[9] = df - ce * b;

						te[2] = -a * d;
						te[6] = b;
						te[10] = a * c;
				} else if (euler.order === 'ZYX') {

						var ae = a * e,
						    af = a * f,
						    be = b * e,
						    bf = b * f;

						te[0] = c * e;
						te[4] = be * d - af;
						te[8] = ae * d + bf;

						te[1] = c * f;
						te[5] = bf * d + ae;
						te[9] = af * d - be;

						te[2] = -d;
						te[6] = b * c;
						te[10] = a * c;
				} else if (euler.order === 'YZX') {

						var ac = a * c,
						    ad = a * d,
						    bc = b * c,
						    bd = b * d;

						te[0] = c * e;
						te[4] = bd - ac * f;
						te[8] = bc * f + ad;

						te[1] = f;
						te[5] = a * e;
						te[9] = -b * e;

						te[2] = -d * e;
						te[6] = ad * f + bc;
						te[10] = ac - bd * f;
				} else if (euler.order === 'XZY') {

						var ac = a * c,
						    ad = a * d,
						    bc = b * c,
						    bd = b * d;

						te[0] = c * e;
						te[4] = -f;
						te[8] = d * e;

						te[1] = ac * f + bd;
						te[5] = a * e;
						te[9] = ad * f - bc;

						te[2] = bc * f - ad;
						te[6] = b * e;
						te[10] = bd * f + ac;
				}

				// last column
				te[3] = 0;
				te[7] = 0;
				te[11] = 0;

				// bottom row
				te[12] = 0;
				te[13] = 0;
				te[14] = 0;
				te[15] = 1;

				return this;
		},

		makeRotationFromQuaternion: function makeRotationFromQuaternion(q) {

				var te = this.elements;

				var x = q.x,
				    y = q.y,
				    z = q.z,
				    w = q.w;
				var x2 = x + x,
				    y2 = y + y,
				    z2 = z + z;
				var xx = x * x2,
				    xy = x * y2,
				    xz = x * z2;
				var yy = y * y2,
				    yz = y * z2,
				    zz = z * z2;
				var wx = w * x2,
				    wy = w * y2,
				    wz = w * z2;

				te[0] = 1 - (yy + zz);
				te[4] = xy - wz;
				te[8] = xz + wy;

				te[1] = xy + wz;
				te[5] = 1 - (xx + zz);
				te[9] = yz - wx;

				te[2] = xz - wy;
				te[6] = yz + wx;
				te[10] = 1 - (xx + yy);

				// last column
				te[3] = 0;
				te[7] = 0;
				te[11] = 0;

				// bottom row
				te[12] = 0;
				te[13] = 0;
				te[14] = 0;
				te[15] = 1;

				return this;
		},

		lookAt: function () {

				var x, y, z;

				return function lookAt(eye, target, up) {

						if (x === undefined) {

								x = new _Vector.Vector3();
								y = new _Vector.Vector3();
								z = new _Vector.Vector3();
						}

						var te = this.elements;

						z.subVectors(eye, target).normalize();

						if (z.lengthSq() === 0) {

								z.z = 1;
						}

						x.crossVectors(up, z).normalize();

						if (x.lengthSq() === 0) {

								z.z += 0.0001;
								x.crossVectors(up, z).normalize();
						}

						y.crossVectors(z, x);

						te[0] = x.x;te[4] = y.x;te[8] = z.x;
						te[1] = x.y;te[5] = y.y;te[9] = z.y;
						te[2] = x.z;te[6] = y.z;te[10] = z.z;

						return this;
				};
		}(),

		multiply: function multiply(m, n) {

				if (n !== undefined) {

						console.warn('THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead.');
						return this.multiplyMatrices(m, n);
				}

				return this.multiplyMatrices(this, m);
		},

		premultiply: function premultiply(m) {

				return this.multiplyMatrices(m, this);
		},

		multiplyMatrices: function multiplyMatrices(a, b) {

				var ae = a.elements;
				var be = b.elements;
				var te = this.elements;

				var a11 = ae[0],
				    a12 = ae[4],
				    a13 = ae[8],
				    a14 = ae[12];
				var a21 = ae[1],
				    a22 = ae[5],
				    a23 = ae[9],
				    a24 = ae[13];
				var a31 = ae[2],
				    a32 = ae[6],
				    a33 = ae[10],
				    a34 = ae[14];
				var a41 = ae[3],
				    a42 = ae[7],
				    a43 = ae[11],
				    a44 = ae[15];

				var b11 = be[0],
				    b12 = be[4],
				    b13 = be[8],
				    b14 = be[12];
				var b21 = be[1],
				    b22 = be[5],
				    b23 = be[9],
				    b24 = be[13];
				var b31 = be[2],
				    b32 = be[6],
				    b33 = be[10],
				    b34 = be[14];
				var b41 = be[3],
				    b42 = be[7],
				    b43 = be[11],
				    b44 = be[15];

				te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
				te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
				te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
				te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

				te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
				te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
				te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
				te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

				te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
				te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
				te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
				te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

				te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
				te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
				te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
				te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

				return this;
		},

		multiplyToArray: function multiplyToArray(a, b, r) {

				var te = this.elements;

				this.multiplyMatrices(a, b);

				r[0] = te[0];r[1] = te[1];r[2] = te[2];r[3] = te[3];
				r[4] = te[4];r[5] = te[5];r[6] = te[6];r[7] = te[7];
				r[8] = te[8];r[9] = te[9];r[10] = te[10];r[11] = te[11];
				r[12] = te[12];r[13] = te[13];r[14] = te[14];r[15] = te[15];

				return this;
		},

		multiplyScalar: function multiplyScalar(s) {

				var te = this.elements;

				te[0] *= s;te[4] *= s;te[8] *= s;te[12] *= s;
				te[1] *= s;te[5] *= s;te[9] *= s;te[13] *= s;
				te[2] *= s;te[6] *= s;te[10] *= s;te[14] *= s;
				te[3] *= s;te[7] *= s;te[11] *= s;te[15] *= s;

				return this;
		},

		applyToVector3Array: function () {

				var v1;

				return function applyToVector3Array(array, offset, length) {

						if (v1 === undefined) v1 = new _Vector.Vector3();
						if (offset === undefined) offset = 0;
						if (length === undefined) length = array.length;

						for (var i = 0, j = offset; i < length; i += 3, j += 3) {

								v1.fromArray(array, j);
								v1.applyMatrix4(this);
								v1.toArray(array, j);
						}

						return array;
				};
		}(),

		applyToBuffer: function () {

				var v1;

				return function applyToBuffer(buffer, offset, length) {

						if (v1 === undefined) v1 = new _Vector.Vector3();
						if (offset === undefined) offset = 0;
						if (length === undefined) length = buffer.length / buffer.itemSize;

						for (var i = 0, j = offset; i < length; i++, j++) {

								v1.x = buffer.getX(j);
								v1.y = buffer.getY(j);
								v1.z = buffer.getZ(j);

								v1.applyMatrix4(this);

								buffer.setXYZ(j, v1.x, v1.y, v1.z);
						}

						return buffer;
				};
		}(),

		determinant: function determinant() {

				var te = this.elements;

				var n11 = te[0],
				    n12 = te[4],
				    n13 = te[8],
				    n14 = te[12];
				var n21 = te[1],
				    n22 = te[5],
				    n23 = te[9],
				    n24 = te[13];
				var n31 = te[2],
				    n32 = te[6],
				    n33 = te[10],
				    n34 = te[14];
				var n41 = te[3],
				    n42 = te[7],
				    n43 = te[11],
				    n44 = te[15];

				//TODO: make this more efficient
				//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

				return n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) + n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) + n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) + n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31);
		},

		transpose: function transpose() {

				var te = this.elements;
				var tmp;

				tmp = te[1];te[1] = te[4];te[4] = tmp;
				tmp = te[2];te[2] = te[8];te[8] = tmp;
				tmp = te[6];te[6] = te[9];te[9] = tmp;

				tmp = te[3];te[3] = te[12];te[12] = tmp;
				tmp = te[7];te[7] = te[13];te[13] = tmp;
				tmp = te[11];te[11] = te[14];te[14] = tmp;

				return this;
		},

		setPosition: function setPosition(v) {

				var te = this.elements;

				te[12] = v.x;
				te[13] = v.y;
				te[14] = v.z;

				return this;
		},

		getInverse: function getInverse(m, throwOnDegenerate) {

				// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
				var te = this.elements,
				    me = m.elements,
				    n11 = me[0],
				    n21 = me[1],
				    n31 = me[2],
				    n41 = me[3],
				    n12 = me[4],
				    n22 = me[5],
				    n32 = me[6],
				    n42 = me[7],
				    n13 = me[8],
				    n23 = me[9],
				    n33 = me[10],
				    n43 = me[11],
				    n14 = me[12],
				    n24 = me[13],
				    n34 = me[14],
				    n44 = me[15],
				    t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
				    t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
				    t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
				    t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

				var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

				if (det === 0) {

						var msg = "THREE.Matrix4.getInverse(): can't invert matrix, determinant is 0";

						if (throwOnDegenerate === true) {

								throw new Error(msg);
						} else {

								console.warn(msg);
						}

						return this.identity();
				}

				var detInv = 1 / det;

				te[0] = t11 * detInv;
				te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
				te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
				te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

				te[4] = t12 * detInv;
				te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
				te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
				te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

				te[8] = t13 * detInv;
				te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
				te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
				te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

				te[12] = t14 * detInv;
				te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
				te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
				te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

				return this;
		},

		scale: function scale(v) {

				var te = this.elements;
				var x = v.x,
				    y = v.y,
				    z = v.z;

				te[0] *= x;te[4] *= y;te[8] *= z;
				te[1] *= x;te[5] *= y;te[9] *= z;
				te[2] *= x;te[6] *= y;te[10] *= z;
				te[3] *= x;te[7] *= y;te[11] *= z;

				return this;
		},

		getMaxScaleOnAxis: function getMaxScaleOnAxis() {

				var te = this.elements;

				var scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
				var scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
				var scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

				return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
		},

		makeTranslation: function makeTranslation(x, y, z) {

				this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);

				return this;
		},

		makeRotationX: function makeRotationX(theta) {

				var c = Math.cos(theta),
				    s = Math.sin(theta);

				this.set(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);

				return this;
		},

		makeRotationY: function makeRotationY(theta) {

				var c = Math.cos(theta),
				    s = Math.sin(theta);

				this.set(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);

				return this;
		},

		makeRotationZ: function makeRotationZ(theta) {

				var c = Math.cos(theta),
				    s = Math.sin(theta);

				this.set(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

				return this;
		},

		makeRotationAxis: function makeRotationAxis(axis, angle) {

				// Based on http://www.gamedev.net/reference/articles/article1199.asp

				var c = Math.cos(angle);
				var s = Math.sin(angle);
				var t = 1 - c;
				var x = axis.x,
				    y = axis.y,
				    z = axis.z;
				var tx = t * x,
				    ty = t * y;

				this.set(tx * x + c, tx * y - s * z, tx * z + s * y, 0, tx * y + s * z, ty * y + c, ty * z - s * x, 0, tx * z - s * y, ty * z + s * x, t * z * z + c, 0, 0, 0, 0, 1);

				return this;
		},

		makeScale: function makeScale(x, y, z) {

				this.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);

				return this;
		},

		makeShear: function makeShear(x, y, z) {

				this.set(1, y, z, 0, x, 1, z, 0, x, y, 1, 0, 0, 0, 0, 1);

				return this;
		},

		compose: function compose(position, quaternion, scale) {

				this.makeRotationFromQuaternion(quaternion);
				this.scale(scale);
				this.setPosition(position);

				return this;
		},

		decompose: function () {

				var vector, matrix;

				return function decompose(position, quaternion, scale) {

						if (vector === undefined) {

								vector = new _Vector.Vector3();
								matrix = new Matrix4();
						}

						var te = this.elements;

						var sx = vector.set(te[0], te[1], te[2]).length();
						var sy = vector.set(te[4], te[5], te[6]).length();
						var sz = vector.set(te[8], te[9], te[10]).length();

						// if determine is negative, we need to invert one scale
						var det = this.determinant();
						if (det < 0) {

								sx = -sx;
						}

						position.x = te[12];
						position.y = te[13];
						position.z = te[14];

						// scale the rotation part

						matrix.elements.set(this.elements); // at this point matrix is incomplete so we can't use .copy()

						var invSX = 1 / sx;
						var invSY = 1 / sy;
						var invSZ = 1 / sz;

						matrix.elements[0] *= invSX;
						matrix.elements[1] *= invSX;
						matrix.elements[2] *= invSX;

						matrix.elements[4] *= invSY;
						matrix.elements[5] *= invSY;
						matrix.elements[6] *= invSY;

						matrix.elements[8] *= invSZ;
						matrix.elements[9] *= invSZ;
						matrix.elements[10] *= invSZ;

						quaternion.setFromRotationMatrix(matrix);

						scale.x = sx;
						scale.y = sy;
						scale.z = sz;

						return this;
				};
		}(),

		makeFrustum: function makeFrustum(left, right, bottom, top, near, far) {

				var te = this.elements;
				var x = 2 * near / (right - left);
				var y = 2 * near / (top - bottom);

				var a = (right + left) / (right - left);
				var b = (top + bottom) / (top - bottom);
				var c = -(far + near) / (far - near);
				var d = -2 * far * near / (far - near);

				te[0] = x;te[4] = 0;te[8] = a;te[12] = 0;
				te[1] = 0;te[5] = y;te[9] = b;te[13] = 0;
				te[2] = 0;te[6] = 0;te[10] = c;te[14] = d;
				te[3] = 0;te[7] = 0;te[11] = -1;te[15] = 0;

				return this;
		},

		makePerspective: function makePerspective(fov, aspect, near, far) {

				var ymax = near * Math.tan(_Math2._Math.DEG2RAD * fov * 0.5);
				var ymin = -ymax;
				var xmin = ymin * aspect;
				var xmax = ymax * aspect;

				return this.makeFrustum(xmin, xmax, ymin, ymax, near, far);
		},

		makeOrthographic: function makeOrthographic(left, right, top, bottom, near, far) {

				var te = this.elements;
				var w = 1.0 / (right - left);
				var h = 1.0 / (top - bottom);
				var p = 1.0 / (far - near);

				var x = (right + left) * w;
				var y = (top + bottom) * h;
				var z = (far + near) * p;

				te[0] = 2 * w;te[4] = 0;te[8] = 0;te[12] = -x;
				te[1] = 0;te[5] = 2 * h;te[9] = 0;te[13] = -y;
				te[2] = 0;te[6] = 0;te[10] = -2 * p;te[14] = -z;
				te[3] = 0;te[7] = 0;te[11] = 0;te[15] = 1;

				return this;
		},

		equals: function equals(matrix) {

				var te = this.elements;
				var me = matrix.elements;

				for (var i = 0; i < 16; i++) {

						if (te[i] !== me[i]) return false;
				}

				return true;
		},

		fromArray: function fromArray(array, offset) {

				if (offset === undefined) offset = 0;

				for (var i = 0; i < 16; i++) {

						this.elements[i] = array[i + offset];
				}

				return this;
		},

		toArray: function toArray(array, offset) {

				if (array === undefined) array = [];
				if (offset === undefined) offset = 0;

				var te = this.elements;

				array[offset] = te[0];
				array[offset + 1] = te[1];
				array[offset + 2] = te[2];
				array[offset + 3] = te[3];

				array[offset + 4] = te[4];
				array[offset + 5] = te[5];
				array[offset + 6] = te[6];
				array[offset + 7] = te[7];

				array[offset + 8] = te[8];
				array[offset + 9] = te[9];
				array[offset + 10] = te[10];
				array[offset + 11] = te[11];

				array[offset + 12] = te[12];
				array[offset + 13] = te[13];
				array[offset + 14] = te[14];
				array[offset + 15] = te[15];

				return array;
		}

};

exports.Matrix4 = Matrix4;

},{"./Math":13,"./Vector3":17}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.Quaternion = undefined;

var _Vector = require('./Vector3');

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://clara.io
 */

function Quaternion(x, y, z, w) {

		this._x = x || 0;
		this._y = y || 0;
		this._z = z || 0;
		this._w = w !== undefined ? w : 1;
}

Quaternion.prototype = {

		constructor: Quaternion,

		get x() {

				return this._x;
		},

		set x(value) {

				this._x = value;
				this.onChangeCallback();
		},

		get y() {

				return this._y;
		},

		set y(value) {

				this._y = value;
				this.onChangeCallback();
		},

		get z() {

				return this._z;
		},

		set z(value) {

				this._z = value;
				this.onChangeCallback();
		},

		get w() {

				return this._w;
		},

		set w(value) {

				this._w = value;
				this.onChangeCallback();
		},

		set: function set(x, y, z, w) {

				this._x = x;
				this._y = y;
				this._z = z;
				this._w = w;

				this.onChangeCallback();

				return this;
		},

		clone: function clone() {

				return new this.constructor(this._x, this._y, this._z, this._w);
		},

		copy: function copy(quaternion) {

				this._x = quaternion.x;
				this._y = quaternion.y;
				this._z = quaternion.z;
				this._w = quaternion.w;

				this.onChangeCallback();

				return this;
		},

		setFromEuler: function setFromEuler(euler, update) {

				if ((euler && euler.isEuler) === false) {

						throw new Error('THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.');
				}

				// http://www.mathworks.com/matlabcentral/fileexchange/
				// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
				//	content/SpinCalc.m

				var c1 = Math.cos(euler._x / 2);
				var c2 = Math.cos(euler._y / 2);
				var c3 = Math.cos(euler._z / 2);
				var s1 = Math.sin(euler._x / 2);
				var s2 = Math.sin(euler._y / 2);
				var s3 = Math.sin(euler._z / 2);

				var order = euler.order;

				if (order === 'XYZ') {

						this._x = s1 * c2 * c3 + c1 * s2 * s3;
						this._y = c1 * s2 * c3 - s1 * c2 * s3;
						this._z = c1 * c2 * s3 + s1 * s2 * c3;
						this._w = c1 * c2 * c3 - s1 * s2 * s3;
				} else if (order === 'YXZ') {

						this._x = s1 * c2 * c3 + c1 * s2 * s3;
						this._y = c1 * s2 * c3 - s1 * c2 * s3;
						this._z = c1 * c2 * s3 - s1 * s2 * c3;
						this._w = c1 * c2 * c3 + s1 * s2 * s3;
				} else if (order === 'ZXY') {

						this._x = s1 * c2 * c3 - c1 * s2 * s3;
						this._y = c1 * s2 * c3 + s1 * c2 * s3;
						this._z = c1 * c2 * s3 + s1 * s2 * c3;
						this._w = c1 * c2 * c3 - s1 * s2 * s3;
				} else if (order === 'ZYX') {

						this._x = s1 * c2 * c3 - c1 * s2 * s3;
						this._y = c1 * s2 * c3 + s1 * c2 * s3;
						this._z = c1 * c2 * s3 - s1 * s2 * c3;
						this._w = c1 * c2 * c3 + s1 * s2 * s3;
				} else if (order === 'YZX') {

						this._x = s1 * c2 * c3 + c1 * s2 * s3;
						this._y = c1 * s2 * c3 + s1 * c2 * s3;
						this._z = c1 * c2 * s3 - s1 * s2 * c3;
						this._w = c1 * c2 * c3 - s1 * s2 * s3;
				} else if (order === 'XZY') {

						this._x = s1 * c2 * c3 - c1 * s2 * s3;
						this._y = c1 * s2 * c3 - s1 * c2 * s3;
						this._z = c1 * c2 * s3 + s1 * s2 * c3;
						this._w = c1 * c2 * c3 + s1 * s2 * s3;
				}

				if (update !== false) this.onChangeCallback();

				return this;
		},

		setFromAxisAngle: function setFromAxisAngle(axis, angle) {

				// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

				// assumes axis is normalized

				var halfAngle = angle / 2,
				    s = Math.sin(halfAngle);

				this._x = axis.x * s;
				this._y = axis.y * s;
				this._z = axis.z * s;
				this._w = Math.cos(halfAngle);

				this.onChangeCallback();

				return this;
		},

		setFromRotationMatrix: function setFromRotationMatrix(m) {

				// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

				// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

				var te = m.elements,
				    m11 = te[0],
				    m12 = te[4],
				    m13 = te[8],
				    m21 = te[1],
				    m22 = te[5],
				    m23 = te[9],
				    m31 = te[2],
				    m32 = te[6],
				    m33 = te[10],
				    trace = m11 + m22 + m33,
				    s;

				if (trace > 0) {

						s = 0.5 / Math.sqrt(trace + 1.0);

						this._w = 0.25 / s;
						this._x = (m32 - m23) * s;
						this._y = (m13 - m31) * s;
						this._z = (m21 - m12) * s;
				} else if (m11 > m22 && m11 > m33) {

						s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

						this._w = (m32 - m23) / s;
						this._x = 0.25 * s;
						this._y = (m12 + m21) / s;
						this._z = (m13 + m31) / s;
				} else if (m22 > m33) {

						s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

						this._w = (m13 - m31) / s;
						this._x = (m12 + m21) / s;
						this._y = 0.25 * s;
						this._z = (m23 + m32) / s;
				} else {

						s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

						this._w = (m21 - m12) / s;
						this._x = (m13 + m31) / s;
						this._y = (m23 + m32) / s;
						this._z = 0.25 * s;
				}

				this.onChangeCallback();

				return this;
		},

		setFromUnitVectors: function () {

				// http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final

				// assumes direction vectors vFrom and vTo are normalized

				var v1, r;

				var EPS = 0.000001;

				return function setFromUnitVectors(vFrom, vTo) {

						if (v1 === undefined) v1 = new _Vector.Vector3();

						r = vFrom.dot(vTo) + 1;

						if (r < EPS) {

								r = 0;

								if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {

										v1.set(-vFrom.y, vFrom.x, 0);
								} else {

										v1.set(0, -vFrom.z, vFrom.y);
								}
						} else {

								v1.crossVectors(vFrom, vTo);
						}

						this._x = v1.x;
						this._y = v1.y;
						this._z = v1.z;
						this._w = r;

						return this.normalize();
				};
		}(),

		inverse: function inverse() {

				return this.conjugate().normalize();
		},

		conjugate: function conjugate() {

				this._x *= -1;
				this._y *= -1;
				this._z *= -1;

				this.onChangeCallback();

				return this;
		},

		dot: function dot(v) {

				return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
		},

		lengthSq: function lengthSq() {

				return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
		},

		length: function length() {

				return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
		},

		normalize: function normalize() {

				var l = this.length();

				if (l === 0) {

						this._x = 0;
						this._y = 0;
						this._z = 0;
						this._w = 1;
				} else {

						l = 1 / l;

						this._x = this._x * l;
						this._y = this._y * l;
						this._z = this._z * l;
						this._w = this._w * l;
				}

				this.onChangeCallback();

				return this;
		},

		multiply: function multiply(q, p) {

				if (p !== undefined) {

						console.warn('THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.');
						return this.multiplyQuaternions(q, p);
				}

				return this.multiplyQuaternions(this, q);
		},

		premultiply: function premultiply(q) {

				return this.multiplyQuaternions(q, this);
		},

		multiplyQuaternions: function multiplyQuaternions(a, b) {

				// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

				var qax = a._x,
				    qay = a._y,
				    qaz = a._z,
				    qaw = a._w;
				var qbx = b._x,
				    qby = b._y,
				    qbz = b._z,
				    qbw = b._w;

				this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
				this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
				this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
				this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

				this.onChangeCallback();

				return this;
		},

		slerp: function slerp(qb, t) {

				if (t === 0) return this;
				if (t === 1) return this.copy(qb);

				var x = this._x,
				    y = this._y,
				    z = this._z,
				    w = this._w;

				// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

				var cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

				if (cosHalfTheta < 0) {

						this._w = -qb._w;
						this._x = -qb._x;
						this._y = -qb._y;
						this._z = -qb._z;

						cosHalfTheta = -cosHalfTheta;
				} else {

						this.copy(qb);
				}

				if (cosHalfTheta >= 1.0) {

						this._w = w;
						this._x = x;
						this._y = y;
						this._z = z;

						return this;
				}

				var sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

				if (Math.abs(sinHalfTheta) < 0.001) {

						this._w = 0.5 * (w + this._w);
						this._x = 0.5 * (x + this._x);
						this._y = 0.5 * (y + this._y);
						this._z = 0.5 * (z + this._z);

						return this;
				}

				var halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
				var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
				    ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

				this._w = w * ratioA + this._w * ratioB;
				this._x = x * ratioA + this._x * ratioB;
				this._y = y * ratioA + this._y * ratioB;
				this._z = z * ratioA + this._z * ratioB;

				this.onChangeCallback();

				return this;
		},

		equals: function equals(quaternion) {

				return quaternion._x === this._x && quaternion._y === this._y && quaternion._z === this._z && quaternion._w === this._w;
		},

		fromArray: function fromArray(array, offset) {

				if (offset === undefined) offset = 0;

				this._x = array[offset];
				this._y = array[offset + 1];
				this._z = array[offset + 2];
				this._w = array[offset + 3];

				this.onChangeCallback();

				return this;
		},

		toArray: function toArray(array, offset) {

				if (array === undefined) array = [];
				if (offset === undefined) offset = 0;

				array[offset] = this._x;
				array[offset + 1] = this._y;
				array[offset + 2] = this._z;
				array[offset + 3] = this._w;

				return array;
		},

		onChange: function onChange(callback) {

				this.onChangeCallback = callback;

				return this;
		},

		onChangeCallback: function onChangeCallback() {}

};

Object.assign(Quaternion, {

		slerp: function slerp(qa, qb, qm, t) {

				return qm.copy(qa).slerp(qb, t);
		},

		slerpFlat: function slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {

				// fuzz-free, array-based Quaternion SLERP operation

				var x0 = src0[srcOffset0 + 0],
				    y0 = src0[srcOffset0 + 1],
				    z0 = src0[srcOffset0 + 2],
				    w0 = src0[srcOffset0 + 3],
				    x1 = src1[srcOffset1 + 0],
				    y1 = src1[srcOffset1 + 1],
				    z1 = src1[srcOffset1 + 2],
				    w1 = src1[srcOffset1 + 3];

				if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {

						var s = 1 - t,
						    cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
						    dir = cos >= 0 ? 1 : -1,
						    sqrSin = 1 - cos * cos;

						// Skip the Slerp for tiny steps to avoid numeric problems:
						if (sqrSin > Number.EPSILON) {

								var sin = Math.sqrt(sqrSin),
								    len = Math.atan2(sin, cos * dir);

								s = Math.sin(s * len) / sin;
								t = Math.sin(t * len) / sin;
						}

						var tDir = t * dir;

						x0 = x0 * s + x1 * tDir;
						y0 = y0 * s + y1 * tDir;
						z0 = z0 * s + z1 * tDir;
						w0 = w0 * s + w1 * tDir;

						// Normalize in case we just did a lerp:
						if (s === 1 - t) {

								var f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);

								x0 *= f;
								y0 *= f;
								z0 *= f;
								w0 *= f;
						}
				}

				dst[dstOffset] = x0;
				dst[dstOffset + 1] = y0;
				dst[dstOffset + 2] = z0;
				dst[dstOffset + 3] = w0;
		}

});

exports.Quaternion = Quaternion;

},{"./Vector3":17}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * @author mrdoob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 * @author egraether / http://egraether.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */

function Vector2(x, y) {

	this.x = x || 0;
	this.y = y || 0;
}

Vector2.prototype = {

	constructor: Vector2,

	isVector2: true,

	get width() {

		return this.x;
	},

	set width(value) {

		this.x = value;
	},

	get height() {

		return this.y;
	},

	set height(value) {

		this.y = value;
	},

	//

	set: function set(x, y) {

		this.x = x;
		this.y = y;

		return this;
	},

	setScalar: function setScalar(scalar) {

		this.x = scalar;
		this.y = scalar;

		return this;
	},

	setX: function setX(x) {

		this.x = x;

		return this;
	},

	setY: function setY(y) {

		this.y = y;

		return this;
	},

	setComponent: function setComponent(index, value) {

		switch (index) {

			case 0:
				this.x = value;break;
			case 1:
				this.y = value;break;
			default:
				throw new Error('index is out of range: ' + index);

		}

		return this;
	},

	getComponent: function getComponent(index) {

		switch (index) {

			case 0:
				return this.x;
			case 1:
				return this.y;
			default:
				throw new Error('index is out of range: ' + index);

		}
	},

	clone: function clone() {

		return new this.constructor(this.x, this.y);
	},

	copy: function copy(v) {

		this.x = v.x;
		this.y = v.y;

		return this;
	},

	add: function add(v, w) {

		if (w !== undefined) {

			console.warn('THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
			return this.addVectors(v, w);
		}

		this.x += v.x;
		this.y += v.y;

		return this;
	},

	addScalar: function addScalar(s) {

		this.x += s;
		this.y += s;

		return this;
	},

	addVectors: function addVectors(a, b) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;

		return this;
	},

	addScaledVector: function addScaledVector(v, s) {

		this.x += v.x * s;
		this.y += v.y * s;

		return this;
	},

	sub: function sub(v, w) {

		if (w !== undefined) {

			console.warn('THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
			return this.subVectors(v, w);
		}

		this.x -= v.x;
		this.y -= v.y;

		return this;
	},

	subScalar: function subScalar(s) {

		this.x -= s;
		this.y -= s;

		return this;
	},

	subVectors: function subVectors(a, b) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;

		return this;
	},

	multiply: function multiply(v) {

		this.x *= v.x;
		this.y *= v.y;

		return this;
	},

	multiplyScalar: function multiplyScalar(scalar) {

		if (isFinite(scalar)) {

			this.x *= scalar;
			this.y *= scalar;
		} else {

			this.x = 0;
			this.y = 0;
		}

		return this;
	},

	divide: function divide(v) {

		this.x /= v.x;
		this.y /= v.y;

		return this;
	},

	divideScalar: function divideScalar(scalar) {

		return this.multiplyScalar(1 / scalar);
	},

	min: function min(v) {

		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);

		return this;
	},

	max: function max(v) {

		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);

		return this;
	},

	clamp: function clamp(min, max) {

		// This function assumes min < max, if this assumption isn't true it will not operate correctly

		this.x = Math.max(min.x, Math.min(max.x, this.x));
		this.y = Math.max(min.y, Math.min(max.y, this.y));

		return this;
	},

	clampScalar: function () {

		var min, max;

		return function clampScalar(minVal, maxVal) {

			if (min === undefined) {

				min = new Vector2();
				max = new Vector2();
			}

			min.set(minVal, minVal);
			max.set(maxVal, maxVal);

			return this.clamp(min, max);
		};
	}(),

	clampLength: function clampLength(min, max) {

		var length = this.length();

		return this.multiplyScalar(Math.max(min, Math.min(max, length)) / length);
	},

	floor: function floor() {

		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);

		return this;
	},

	ceil: function ceil() {

		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);

		return this;
	},

	round: function round() {

		this.x = Math.round(this.x);
		this.y = Math.round(this.y);

		return this;
	},

	roundToZero: function roundToZero() {

		this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
		this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);

		return this;
	},

	negate: function negate() {

		this.x = -this.x;
		this.y = -this.y;

		return this;
	},

	dot: function dot(v) {

		return this.x * v.x + this.y * v.y;
	},

	lengthSq: function lengthSq() {

		return this.x * this.x + this.y * this.y;
	},

	length: function length() {

		return Math.sqrt(this.x * this.x + this.y * this.y);
	},

	lengthManhattan: function lengthManhattan() {

		return Math.abs(this.x) + Math.abs(this.y);
	},

	normalize: function normalize() {

		return this.divideScalar(this.length());
	},

	angle: function angle() {

		// computes the angle in radians with respect to the positive x-axis

		var angle = Math.atan2(this.y, this.x);

		if (angle < 0) angle += 2 * Math.PI;

		return angle;
	},

	distanceTo: function distanceTo(v) {

		return Math.sqrt(this.distanceToSquared(v));
	},

	distanceToSquared: function distanceToSquared(v) {

		var dx = this.x - v.x,
		    dy = this.y - v.y;
		return dx * dx + dy * dy;
	},

	distanceToManhattan: function distanceToManhattan(v) {

		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
	},

	setLength: function setLength(length) {

		return this.multiplyScalar(length / this.length());
	},

	lerp: function lerp(v, alpha) {

		this.x += (v.x - this.x) * alpha;
		this.y += (v.y - this.y) * alpha;

		return this;
	},

	lerpVectors: function lerpVectors(v1, v2, alpha) {

		return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
	},

	equals: function equals(v) {

		return v.x === this.x && v.y === this.y;
	},

	fromArray: function fromArray(array, offset) {

		if (offset === undefined) offset = 0;

		this.x = array[offset];
		this.y = array[offset + 1];

		return this;
	},

	toArray: function toArray(array, offset) {

		if (array === undefined) array = [];
		if (offset === undefined) offset = 0;

		array[offset] = this.x;
		array[offset + 1] = this.y;

		return array;
	},

	fromAttribute: function fromAttribute(attribute, index, offset) {

		if (offset === undefined) offset = 0;

		index = index * attribute.itemSize + offset;

		this.x = attribute.array[index];
		this.y = attribute.array[index + 1];

		return this;
	},

	rotateAround: function rotateAround(center, angle) {

		var c = Math.cos(angle),
		    s = Math.sin(angle);

		var x = this.x - center.x;
		var y = this.y - center.y;

		this.x = x * c - y * s + center.x;
		this.y = x * s + y * c + center.y;

		return this;
	}

};

exports.Vector2 = Vector2;

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.Vector3 = undefined;

var _Math2 = require('./Math');

var _Matrix = require('./Matrix4');

var _Quaternion = require('./Quaternion');

/**
 * @author mrdoob / http://mrdoob.com/
 * @author *kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */

function Vector3(x, y, z) {

		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
}

Vector3.prototype = {

		constructor: Vector3,

		isVector3: true,

		set: function set(x, y, z) {

				this.x = x;
				this.y = y;
				this.z = z;

				return this;
		},

		setScalar: function setScalar(scalar) {

				this.x = scalar;
				this.y = scalar;
				this.z = scalar;

				return this;
		},

		setX: function setX(x) {

				this.x = x;

				return this;
		},

		setY: function setY(y) {

				this.y = y;

				return this;
		},

		setZ: function setZ(z) {

				this.z = z;

				return this;
		},

		setComponent: function setComponent(index, value) {

				switch (index) {

						case 0:
								this.x = value;break;
						case 1:
								this.y = value;break;
						case 2:
								this.z = value;break;
						default:
								throw new Error('index is out of range: ' + index);

				}

				return this;
		},

		getComponent: function getComponent(index) {

				switch (index) {

						case 0:
								return this.x;
						case 1:
								return this.y;
						case 2:
								return this.z;
						default:
								throw new Error('index is out of range: ' + index);

				}
		},

		clone: function clone() {

				return new this.constructor(this.x, this.y, this.z);
		},

		copy: function copy(v) {

				this.x = v.x;
				this.y = v.y;
				this.z = v.z;

				return this;
		},

		add: function add(v, w) {

				if (w !== undefined) {

						console.warn('THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
						return this.addVectors(v, w);
				}

				this.x += v.x;
				this.y += v.y;
				this.z += v.z;

				return this;
		},

		addScalar: function addScalar(s) {

				this.x += s;
				this.y += s;
				this.z += s;

				return this;
		},

		addVectors: function addVectors(a, b) {

				this.x = a.x + b.x;
				this.y = a.y + b.y;
				this.z = a.z + b.z;

				return this;
		},

		addScaledVector: function addScaledVector(v, s) {

				this.x += v.x * s;
				this.y += v.y * s;
				this.z += v.z * s;

				return this;
		},

		sub: function sub(v, w) {

				if (w !== undefined) {

						console.warn('THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
						return this.subVectors(v, w);
				}

				this.x -= v.x;
				this.y -= v.y;
				this.z -= v.z;

				return this;
		},

		subScalar: function subScalar(s) {

				this.x -= s;
				this.y -= s;
				this.z -= s;

				return this;
		},

		subVectors: function subVectors(a, b) {

				this.x = a.x - b.x;
				this.y = a.y - b.y;
				this.z = a.z - b.z;

				return this;
		},

		multiply: function multiply(v, w) {

				if (w !== undefined) {

						console.warn('THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.');
						return this.multiplyVectors(v, w);
				}

				this.x *= v.x;
				this.y *= v.y;
				this.z *= v.z;

				return this;
		},

		multiplyScalar: function multiplyScalar(scalar) {

				if (isFinite(scalar)) {

						this.x *= scalar;
						this.y *= scalar;
						this.z *= scalar;
				} else {

						this.x = 0;
						this.y = 0;
						this.z = 0;
				}

				return this;
		},

		multiplyVectors: function multiplyVectors(a, b) {

				this.x = a.x * b.x;
				this.y = a.y * b.y;
				this.z = a.z * b.z;

				return this;
		},

		applyEuler: function () {

				var quaternion;

				return function applyEuler(euler) {

						if ((euler && euler.isEuler) === false) {

								console.error('THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.');
						}

						if (quaternion === undefined) quaternion = new _Quaternion.Quaternion();

						return this.applyQuaternion(quaternion.setFromEuler(euler));
				};
		}(),

		applyAxisAngle: function () {

				var quaternion;

				return function applyAxisAngle(axis, angle) {

						if (quaternion === undefined) quaternion = new _Quaternion.Quaternion();

						return this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle));
				};
		}(),

		applyMatrix3: function applyMatrix3(m) {

				var x = this.x,
				    y = this.y,
				    z = this.z;
				var e = m.elements;

				this.x = e[0] * x + e[3] * y + e[6] * z;
				this.y = e[1] * x + e[4] * y + e[7] * z;
				this.z = e[2] * x + e[5] * y + e[8] * z;

				return this;
		},

		applyMatrix4: function applyMatrix4(m) {

				// input: THREE.Matrix4 affine matrix

				var x = this.x,
				    y = this.y,
				    z = this.z;
				var e = m.elements;

				this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
				this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
				this.z = e[2] * x + e[6] * y + e[10] * z + e[14];

				return this;
		},

		applyProjection: function applyProjection(m) {

				// input: THREE.Matrix4 projection matrix

				var x = this.x,
				    y = this.y,
				    z = this.z;
				var e = m.elements;
				var d = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]); // perspective divide

				this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * d;
				this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * d;
				this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * d;

				return this;
		},

		applyQuaternion: function applyQuaternion(q) {

				var x = this.x,
				    y = this.y,
				    z = this.z;
				var qx = q.x,
				    qy = q.y,
				    qz = q.z,
				    qw = q.w;

				// calculate quat * vector

				var ix = qw * x + qy * z - qz * y;
				var iy = qw * y + qz * x - qx * z;
				var iz = qw * z + qx * y - qy * x;
				var iw = -qx * x - qy * y - qz * z;

				// calculate result * inverse quat

				this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
				this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
				this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

				return this;
		},

		project: function () {

				var matrix;

				return function project(camera) {

						if (matrix === undefined) matrix = new _Matrix.Matrix4();

						matrix.multiplyMatrices(camera.projectionMatrix, matrix.getInverse(camera.matrixWorld));
						return this.applyProjection(matrix);
				};
		}(),

		unproject: function () {

				var matrix;

				return function unproject(camera) {

						if (matrix === undefined) matrix = new _Matrix.Matrix4();

						matrix.multiplyMatrices(camera.matrixWorld, matrix.getInverse(camera.projectionMatrix));
						return this.applyProjection(matrix);
				};
		}(),

		transformDirection: function transformDirection(m) {

				// input: THREE.Matrix4 affine matrix
				// vector interpreted as a direction

				var x = this.x,
				    y = this.y,
				    z = this.z;
				var e = m.elements;

				this.x = e[0] * x + e[4] * y + e[8] * z;
				this.y = e[1] * x + e[5] * y + e[9] * z;
				this.z = e[2] * x + e[6] * y + e[10] * z;

				return this.normalize();
		},

		divide: function divide(v) {

				this.x /= v.x;
				this.y /= v.y;
				this.z /= v.z;

				return this;
		},

		divideScalar: function divideScalar(scalar) {

				return this.multiplyScalar(1 / scalar);
		},

		min: function min(v) {

				this.x = Math.min(this.x, v.x);
				this.y = Math.min(this.y, v.y);
				this.z = Math.min(this.z, v.z);

				return this;
		},

		max: function max(v) {

				this.x = Math.max(this.x, v.x);
				this.y = Math.max(this.y, v.y);
				this.z = Math.max(this.z, v.z);

				return this;
		},

		clamp: function clamp(min, max) {

				// This function assumes min < max, if this assumption isn't true it will not operate correctly

				this.x = Math.max(min.x, Math.min(max.x, this.x));
				this.y = Math.max(min.y, Math.min(max.y, this.y));
				this.z = Math.max(min.z, Math.min(max.z, this.z));

				return this;
		},

		clampScalar: function () {

				var min, max;

				return function clampScalar(minVal, maxVal) {

						if (min === undefined) {

								min = new Vector3();
								max = new Vector3();
						}

						min.set(minVal, minVal, minVal);
						max.set(maxVal, maxVal, maxVal);

						return this.clamp(min, max);
				};
		}(),

		clampLength: function clampLength(min, max) {

				var length = this.length();

				return this.multiplyScalar(Math.max(min, Math.min(max, length)) / length);
		},

		floor: function floor() {

				this.x = Math.floor(this.x);
				this.y = Math.floor(this.y);
				this.z = Math.floor(this.z);

				return this;
		},

		ceil: function ceil() {

				this.x = Math.ceil(this.x);
				this.y = Math.ceil(this.y);
				this.z = Math.ceil(this.z);

				return this;
		},

		round: function round() {

				this.x = Math.round(this.x);
				this.y = Math.round(this.y);
				this.z = Math.round(this.z);

				return this;
		},

		roundToZero: function roundToZero() {

				this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
				this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
				this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);

				return this;
		},

		negate: function negate() {

				this.x = -this.x;
				this.y = -this.y;
				this.z = -this.z;

				return this;
		},

		dot: function dot(v) {

				return this.x * v.x + this.y * v.y + this.z * v.z;
		},

		lengthSq: function lengthSq() {

				return this.x * this.x + this.y * this.y + this.z * this.z;
		},

		length: function length() {

				return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
		},

		lengthManhattan: function lengthManhattan() {

				return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
		},

		normalize: function normalize() {

				return this.divideScalar(this.length());
		},

		setLength: function setLength(length) {

				return this.multiplyScalar(length / this.length());
		},

		lerp: function lerp(v, alpha) {

				this.x += (v.x - this.x) * alpha;
				this.y += (v.y - this.y) * alpha;
				this.z += (v.z - this.z) * alpha;

				return this;
		},

		lerpVectors: function lerpVectors(v1, v2, alpha) {

				return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
		},

		cross: function cross(v, w) {

				if (w !== undefined) {

						console.warn('THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.');
						return this.crossVectors(v, w);
				}

				var x = this.x,
				    y = this.y,
				    z = this.z;

				this.x = y * v.z - z * v.y;
				this.y = z * v.x - x * v.z;
				this.z = x * v.y - y * v.x;

				return this;
		},

		crossVectors: function crossVectors(a, b) {

				var ax = a.x,
				    ay = a.y,
				    az = a.z;
				var bx = b.x,
				    by = b.y,
				    bz = b.z;

				this.x = ay * bz - az * by;
				this.y = az * bx - ax * bz;
				this.z = ax * by - ay * bx;

				return this;
		},

		projectOnVector: function projectOnVector(vector) {

				var scalar = vector.dot(this) / vector.lengthSq();

				return this.copy(vector).multiplyScalar(scalar);
		},

		projectOnPlane: function () {

				var v1;

				return function projectOnPlane(planeNormal) {

						if (v1 === undefined) v1 = new Vector3();

						v1.copy(this).projectOnVector(planeNormal);

						return this.sub(v1);
				};
		}(),

		reflect: function () {

				// reflect incident vector off plane orthogonal to normal
				// normal is assumed to have unit length

				var v1;

				return function reflect(normal) {

						if (v1 === undefined) v1 = new Vector3();

						return this.sub(v1.copy(normal).multiplyScalar(2 * this.dot(normal)));
				};
		}(),

		angleTo: function angleTo(v) {

				var theta = this.dot(v) / Math.sqrt(this.lengthSq() * v.lengthSq());

				// clamp, to handle numerical problems

				return Math.acos(_Math2._Math.clamp(theta, -1, 1));
		},

		distanceTo: function distanceTo(v) {

				return Math.sqrt(this.distanceToSquared(v));
		},

		distanceToSquared: function distanceToSquared(v) {

				var dx = this.x - v.x,
				    dy = this.y - v.y,
				    dz = this.z - v.z;

				return dx * dx + dy * dy + dz * dz;
		},

		distanceToManhattan: function distanceToManhattan(v) {

				return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
		},

		setFromSpherical: function setFromSpherical(s) {

				var sinPhiRadius = Math.sin(s.phi) * s.radius;

				this.x = sinPhiRadius * Math.sin(s.theta);
				this.y = Math.cos(s.phi) * s.radius;
				this.z = sinPhiRadius * Math.cos(s.theta);

				return this;
		},

		setFromMatrixPosition: function setFromMatrixPosition(m) {

				return this.setFromMatrixColumn(m, 3);
		},

		setFromMatrixScale: function setFromMatrixScale(m) {

				var sx = this.setFromMatrixColumn(m, 0).length();
				var sy = this.setFromMatrixColumn(m, 1).length();
				var sz = this.setFromMatrixColumn(m, 2).length();

				this.x = sx;
				this.y = sy;
				this.z = sz;

				return this;
		},

		setFromMatrixColumn: function setFromMatrixColumn(m, index) {

				if (typeof m === 'number') {

						console.warn('THREE.Vector3: setFromMatrixColumn now expects ( matrix, index ).');
						var temp = m;
						m = index;
						index = temp;
				}

				return this.fromArray(m.elements, index * 4);
		},

		equals: function equals(v) {

				return v.x === this.x && v.y === this.y && v.z === this.z;
		},

		fromArray: function fromArray(array, offset) {

				if (offset === undefined) offset = 0;

				this.x = array[offset];
				this.y = array[offset + 1];
				this.z = array[offset + 2];

				return this;
		},

		toArray: function toArray(array, offset) {

				if (array === undefined) array = [];
				if (offset === undefined) offset = 0;

				array[offset] = this.x;
				array[offset + 1] = this.y;
				array[offset + 2] = this.z;

				return array;
		},

		fromAttribute: function fromAttribute(attribute, index, offset) {

				if (offset === undefined) offset = 0;

				index = index * attribute.itemSize + offset;

				this.x = attribute.array[index];
				this.y = attribute.array[index + 1];
				this.z = attribute.array[index + 2];

				return this;
		}

};

exports.Vector3 = Vector3;

},{"./Math":13,"./Matrix4":14,"./Quaternion":15}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.WebGLRenderer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WebGLProgram = require('./webgl/WebGLProgram');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebGLRenderer = function () {
    function WebGLRenderer() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, WebGLRenderer);

        var _alpha = params.alpha || false;
        var _antialias = params.antialias || false;

        this.onContextLost = this.onContextLost.bind(this);
        this._canvas = params.canvas || document.createElement('canvas');
        this.domElement = this._canvas;

        try {
            var attributes = {
                alpha: _alpha,
                antialias: _antialias
                // premultipliedAlpha : true
            };
            this.gl = this._canvas.getContext('webgl2', attributes);

            if (this.gl === null) {
                throw 'Error creating webgl2 context';
            }

            this._canvas.addEventListener('webglcontextlost', this.onContextLost, false);
        } catch (error) {
            console.error('WebGLRenderer: ' + error);
        }
    }

    _createClass(WebGLRenderer, [{
        key: 'onContextLost',
        value: function onContextLost(event) {

            event.preventDefault();
        }
    }, {
        key: 'createProgram',
        value: function createProgram(vertexShaderSource, fragmentShaderSource) {
            var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var webglProgram = new _WebGLProgram.WebGLProgram({
                gl: this.gl,
                vertexShaderSource: vertexShaderSource,
                fragmentShaderSource: fragmentShaderSource,
                transformFeedbackVaryingArray: params.transformFeedbackVaryingArray
            });

            return webglProgram.program;
        }
    }, {
        key: 'setSize',
        value: function setSize(width, height) {
            this._canvas.width = width;
            this._canvas.height = height;

            this.gl.viewport(0, 0, width, height);
        }
    }]);

    return WebGLRenderer;
}();

exports.WebGLRenderer = WebGLRenderer;

},{"./webgl/WebGLProgram":19}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.WebGLProgram = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WebGLShader = require('./WebGLShader');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebGLProgram = exports.WebGLProgram = function () {
    function WebGLProgram(params) {
        _classCallCheck(this, WebGLProgram);

        this.gl = params.gl;
        this._transformFeedbackVaryingArray = params.transformFeedbackVaryingArray;

        this.vertexShader = (0, _WebGLShader.webGLShader)(this.gl, this.gl.VERTEX_SHADER, params.vertexShaderSource);
        this.fragmentShader = (0, _WebGLShader.webGLShader)(this.gl, this.gl.FRAGMENT_SHADER, params.fragmentShaderSource);

        this.program = this.createProgram();
    }

    _createClass(WebGLProgram, [{
        key: 'createProgram',
        value: function createProgram() {
            var program = this.gl.createProgram();
            this.gl.attachShader(program, this.vertexShader);
            this.gl.attachShader(program, this.fragmentShader);

            if (this._transformFeedbackVaryingArray && Array.isArray(this._transformFeedbackVaryingArray)) this.gl.transformFeedbackVaryings(program, this._transformFeedbackVaryingArray, this.gl.SEPARATE_ATTRIBS);
            this.gl.linkProgram(program);

            try {
                var success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
                if (!success) throw this.gl.getProgramInfoLog(this.program);
            } catch (error) {
                console.error('WebGLProgram: ' + error);
            }

            return program;
        }
    }]);

    return WebGLProgram;
}();

},{"./WebGLShader":20}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.webGLShader = webGLShader;

function addLineNumbers(string) {

    var lines = string.split('\n');

    for (var i = 0; i < lines.length; i++) {

        lines[i] = i + 1 + ': ' + lines[i];
    }

    return lines.join('\n');
}

function webGLShader(gl, type, shaderSource) {
    var shader = gl.createShader(type);

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {

        console.error('[WebGLShader]: Shader couldn\'t compile.');
    }

    if (gl.getShaderInfoLog(shader) !== '') {

        console.warn('[WebGLShader]: gl.getShaderInfoLog()', type === gl.VERTEX_SHADER ? 'vertex' : 'fragment', gl.getShaderInfoLog(shader), addLineNumbers(shaderSource));

        return null;
    }

    return shader;
}

},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Box = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Shape2 = require("./Shape");

var _Vector = require("../math/Vector2");

var _Vector2 = require("../math/Vector3");

var _Color = require("../math/Color");

var _Euler = require("../math/Euler");

var _Quaternion = require("../math/Quaternion");

var _PerspectiveCamera = require("../camera/PerspectiveCamera");

var _Matrix = require("../math/Matrix4");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var glslify = require('glslify');

var Box = exports.Box = function (_Shape) {
    _inherits(Box, _Shape);

    function Box(params) {
        _classCallCheck(this, Box);

        var _this = _possibleConstructorReturn(this, (Box.__proto__ || Object.getPrototypeOf(Box)).call(this, {
            renderer: params.renderer,
            vertexShaderSource: glslify(["#version 300 es\n#define GLSLIFY 1\n\nin vec3 aPosition;\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelMatrix;\nuniform mat4 viewMatrix;\n\nvoid main(){\n    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aPosition, 1.0);\n}"]).trim(),
            fragmentShaderSource: glslify(["#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\nuniform vec3 uColor;\n\nout vec4 outColor;\n\nvoid main() {\n  // Just set the output to a constant redish-purple\n  outColor = vec4(uColor, 1.0);\n}"]).trim()
        }));

        _this._onChangeRotation = _this._onChangeRotation.bind(_this);

        _this.time = 0;
        _this.width = 100;
        _this.height = 100;
        _this.depth = 100;

        var x = params.x ? params.x : 0;
        var y = params.y ? params.y : 0;
        var z = params.z ? params.z : -500;

        _this.position = params.position ? params.position : new _Vector2.Vector3(x, y, z);
        _this.scale = params.scale ? params.scale : new _Vector2.Vector3(1, 1, 1);

        _this.verticeNum = params.verticeNum || 100;
        _this.vertices = new Float32Array((_this.verticeNum + 1) * 2);
        _this.vertices[0] = 0;
        _this.vertices[1] = 0;

        _this.rad = params.rad || 1;

        _this._color = new _Color.Color();
        _this.colorVector3 = new _Vector2.Vector3();
        _this.color = '#ff0000' || params.color;

        _this.indiceLength = _this._createShape();

        _this.rotation = new _Euler.Euler();
        _this.rotationQuaternion = new _Quaternion.Quaternion();
        _this.rotationMat = new _Matrix.Matrix4();
        _this.rotation.onChange(_this._onChangeRotation);

        _this.modelMatrix = new _Matrix.Matrix4();
        _this.updateModelMatrix();

        _this.projectionMatrix = new _Matrix.Matrix4();
        _this.projectionMatrixArray = new Float32Array(_this.projectionMatrix.toArray());

        _this.viewMatrix = new _Matrix.Matrix4();
        _this.viewMatrix.identity();
        _this.viewMatrixArray = new Float32Array(_this.viewMatrix.toArray());

        _this.resize();
        return _this;
    }

    _createClass(Box, [{
        key: "_onChangeRotation",
        value: function _onChangeRotation() {
            this.rotationQuaternion.setFromEuler(this.rotation);
            this.updateModelMatrix();
        }
    }, {
        key: "updateModelMatrix",
        value: function updateModelMatrix() {
            this.modelMatrix.compose(this.position, this.rotationQuaternion, this.scale);
            this.modelMatrixArray = new Float32Array(this.modelMatrix.toArray());
        }
    }, {
        key: "updateViewMatrix",
        value: function updateViewMatrix(value) {
            if (value instanceof _Matrix.Matrix4 || value instanceof _PerspectiveCamera.PerspectiveCamera) {
                this.viewMatrixArray = new Float32Array(value.toArray());
            } else {
                console.warn('[Box:updateViewMatrix]value you pass is not matched, you need to pass class of Matrix4 or Camera', value);
            }
        }

        // https://github.com/mrdoob/three.js/blob/master/src/cameras/PerspectiveCamera.js

    }, {
        key: "setProjectionMatrix",
        value: function setProjectionMatrix(fov, aspect, near, far) {
            this.near = near;
            this.far = far;
            this.fov = fov;
            this.aspect = aspect;

            var top = this.near * Math.tan(0.5 * this.fov / 180 * Math.PI);
            var height = 2 * top;
            var width = this.aspect * height;
            var left = -0.5 * width;

            this.projectionMatrix.makeFrustum(left, left + width, top - height, top, near, far);
            this.projectionMatrixArray = new Float32Array(this.projectionMatrix.toArray());
        }
    }, {
        key: "_createShape",
        value: function _createShape() {
            // xyz 3 pt

            this.vertices = new Float32Array(2 * 2 * 2 * 3);

            for (var zz = 0; zz < 2; zz++) {
                var zPos = (zz - 1) * this.depth + this.depth / 2;
                for (var xx = 0; xx < 2; xx++) {
                    var xPos = (xx - 1) * this.width + this.width / 2;
                    for (var yy = 0; yy < 2; yy++) {
                        var yPos = (yy - 1) * this.height + this.height / 2;
                        var num = zz * 2 * 2 + xx * 2 + yy;
                        this.vertices[3 * num] = xPos;
                        this.vertices[3 * num + 1] = yPos;
                        this.vertices[3 * num + 2] = zPos;
                    }
                }
            }

            var indices = [0, 2, 1, // front left
            3, 1, 2, // front right
            1, 3, 5, // top left
            7, 5, 3, // top right
            2, 6, 3, // rightSide left
            7, 3, 6, // rightSide right
            0, 4, 1, // leftSide left
            5, 1, 4, // leftSide right
            0, 4, 2, // bottom left
            6, 4, 2, // bottom right
            4, 6, 5, // back left
            7, 5, 6 // back right
            ];

            var shapeAttributes = {
                positions: { name: 'aPosition', itemSize: 3, data: this.vertices },
                indices: { name: 'indices', indexArray: true, data: new Uint16Array(indices) }
            };

            this.shapeVao = this.gl.createVertexArray();
            this.gl.bindVertexArray(this.shapeVao);

            this.initializeAttributes(shapeAttributes);

            return indices.length;
        }
    }, {
        key: "updateRadius",
        value: function updateRadius(value) {
            if (value) this.rad = value;

            this.gl.bindVertexArray(this.shapeVao);
            this.attributes['positions'].updateData(this.vertices);
        }
    }, {
        key: "_updateUniforms",
        value: function _updateUniforms() {
            this.uniforms['uColor'].set3f(this._color.r, this._color.g, this._color.b);
            this.uniforms['projectionMatrix'].setMatrix4(this.projectionMatrixArray);
            this.uniforms['modelMatrix'].setMatrix4(this.modelMatrixArray);
            this.uniforms['viewMatrix'].setMatrix4(this.viewMatrixArray);
        }
    }, {
        key: "update",
        value: function update() {
            var dt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1 / 60;

            this.time += dt;

            return this;
        }
    }, {
        key: "draw",
        value: function draw() {
            var gl = this.renderer.gl;

            gl.useProgram(this.program);
            gl.bindVertexArray(this.shapeVao);

            this._updateUniforms();

            gl.drawElements(gl.TRIANGLES, this.indiceLength, gl.UNSIGNED_SHORT, 0);
        }
    }, {
        key: "resize",
        value: function resize() {}
    }, {
        key: "color",
        set: function set(value) {
            this._colorStr = value;
            this._color.setStyle(this._colorStr);
        }
    }]);

    return Box;
}(_Shape2.Shape);

},{"../camera/PerspectiveCamera":3,"../math/Color":11,"../math/Euler":12,"../math/Matrix4":14,"../math/Quaternion":15,"../math/Vector2":16,"../math/Vector3":17,"./Shape":24,"glslify":2}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Circle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Shape2 = require("./Shape");

var _Vector = require("../math/Vector2");

var _Vector2 = require("../math/Vector3");

var _Color = require("../math/Color");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var glslify = require('glslify');

var Circle = exports.Circle = function (_Shape) {
    _inherits(Circle, _Shape);

    function Circle(params) {
        _classCallCheck(this, Circle);

        var _this = _possibleConstructorReturn(this, (Circle.__proto__ || Object.getPrototypeOf(Circle)).call(this, {
            renderer: params.renderer,
            vertexShaderSource: glslify(["#version 300 es\n#define GLSLIFY 1\n\nin vec2 aPosition;\n\nuniform vec2 uWindow;\nuniform vec2 uPosition;\n\nvoid main(){\n\n    float xPos =   ( aPosition.x + uPosition.x ) / uWindow.x * 2.0 - 1.0;\n    float yPos = - ( aPosition.y + uPosition.y ) / uWindow.y * 2.0 + 1.0;\n\n    gl_Position = vec4(xPos, yPos, 0.0, 1.0);\n}"]).trim(),
            fragmentShaderSource: glslify(["#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\nuniform vec3 uColor;\n\nout vec4 outColor;\n\nvoid main() {\n  // Just set the output to a constant redish-purple\n  outColor = vec4(uColor, 1.0);\n}"]).trim()
        }));

        _this.time = 0;
        _this.x = params.x ? params.x : 200;
        _this.y = params.y ? params.y : 200;
        _this.rotation = 0;

        _this.verticeNum = params.verticeNum || 100;
        _this.vertices = new Float32Array((_this.verticeNum + 1) * 2);
        _this.vertices[0] = 0;_this.vertices[1] = 0;

        _this.rad = params.rad || 100;

        _this._color = new _Color.Color();
        _this.colorVector3 = new _Vector2.Vector3();
        _this.color = params.color || '#ff0000';

        _this.indiceLength = _this._createShape();

        _this.resize();
        return _this;
    }

    _createClass(Circle, [{
        key: "_createShape",
        value: function _createShape() {

            var indices = [];
            for (var ii = 0; ii < this.verticeNum; ii++) {
                var curNum = ii % this.verticeNum;
                var nextNum = (ii + 1) % this.verticeNum;

                indices.push(0);
                indices.push(curNum + 1);
                indices.push(nextNum + 1);
            };

            var shapeAttributes = {
                positions: { name: 'aPosition', itemSize: 2, data: this.vertices },
                indices: { name: 'indices', indexArray: true, data: new Uint16Array(indices) }
            };

            this.shapeVao = this.gl.createVertexArray();
            this.gl.bindVertexArray(this.shapeVao);

            this.initializeAttributes(shapeAttributes);

            return indices.length;
        }
    }, {
        key: "updateRadius",
        value: function updateRadius(value) {
            if (value) this.rad = value;

            this.gl.bindVertexArray(this.shapeVao);
            this.attributes['positions'].updateData(this.vertices);
        }
    }, {
        key: "_updateUniforms",
        value: function _updateUniforms() {
            this.uniforms['uPosition'].set2f(this.x, this.y);
            this.uniforms['uWindow'].set2f(window.innerWidth, window.innerHeight);
            this.uniforms['uColor'].set3f(this._color.r, this._color.g, this._color.b);
        }
    }, {
        key: "update",
        value: function update() {
            var dt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1 / 60;

            this.time += dt;

            // this.x = window.innerWidth/2; //window.innerWidth/2 + 100 * Math.cos(this.time );
            // this.y = window.innerHeight/2; //window.innerHeight/2 + 100 * Math.sin(this.time );

            return this;
        }
    }, {
        key: "draw",
        value: function draw() {
            var gl = this.renderer.gl;

            gl.useProgram(this.program);
            gl.bindVertexArray(this.shapeVao);

            this._updateUniforms();

            gl.drawElements(gl.TRIANGLES, this.indiceLength, gl.UNSIGNED_SHORT, 0);
        }
    }, {
        key: "resize",
        value: function resize() {}
    }, {
        key: "color",
        set: function set(value) {
            this._colorStr = value;
            this._color.setStyle(this._colorStr);
        },
        get: function get() {
            return this._colorStr;
        }
    }, {
        key: "rad",
        set: function set(value) {
            this._rad = value;
            for (var ii = 0; ii < this.verticeNum; ii++) {
                this.vertices[(ii + 1) * 2 + 0] = this.rad * Math.cos(ii / this.verticeNum * 2 * Math.PI);
                this.vertices[(ii + 1) * 2 + 1] = this.rad * Math.sin(ii / this.verticeNum * 2 * Math.PI);
            }
        },
        get: function get() {
            return this._rad;
        }
    }]);

    return Circle;
}(_Shape2.Shape);

},{"../math/Color":11,"../math/Vector2":16,"../math/Vector3":17,"./Shape":24,"glslify":2}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Rectangle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Shape2 = require("./Shape");

var _Vector = require("../math/Vector2");

var _Vector2 = require("../math/Vector3");

var _Color = require("../math/Color");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var glslify = require('glslify');

var Rectangle = exports.Rectangle = function (_Shape) {
    _inherits(Rectangle, _Shape);

    function Rectangle(params) {
        _classCallCheck(this, Rectangle);

        var _this = _possibleConstructorReturn(this, (Rectangle.__proto__ || Object.getPrototypeOf(Rectangle)).call(this, {
            renderer: params.renderer,
            vertexShaderSource: glslify(["#version 300 es\n#define GLSLIFY 1\n\nin vec2 aPosition;\n\nuniform vec2 uWindow;\nuniform vec2 uPosition;\n\nvoid main(){\n\n    float xPos =   ( aPosition.x + uPosition.x ) / uWindow.x * 2.0 - 1.0;\n    float yPos = - ( aPosition.y + uPosition.y ) / uWindow.y * 2.0 + 1.0;\n\n    gl_Position = vec4(xPos, yPos, 0.0, 1.0);\n}"]).trim(),
            fragmentShaderSource: glslify(["#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\nuniform vec3 uColor;\n\nout vec4 outColor;\n\nvoid main() {\n  // Just set the output to a constant redish-purple\n  outColor = vec4(uColor, 1.0);\n}"]).trim()
        }));

        _this.time = 0;
        _this.width = 100;
        _this.height = 100;
        _this.x = params.x ? params.x : 200;
        _this.y = params.y ? params.y : 200;

        _this.rotation = 0;

        _this.verticeNum = params.verticeNum || 100;
        _this.vertices = new Float32Array((_this.verticeNum + 1) * 2);
        _this.vertices[0] = 0;_this.vertices[1] = 0;

        _this.rad = params.rad || 100;

        _this._color = new _Color.Color();
        _this.colorVector3 = new _Vector2.Vector3();
        _this.color = '#ff0000' || params.color;

        _this.indiceLength = _this._createShape();

        _this.resize();
        return _this;
    }

    _createClass(Rectangle, [{
        key: "_createShape",
        value: function _createShape() {

            this.vertices = new Float32Array(2 * 2 * 2);

            for (var xx = 0; xx < 2; xx++) {
                var xPos = (xx - 1) * this.width + this.width / 2;
                for (var yy = 0; yy < 2; yy++) {
                    var yPos = (yy - 1) * this.height + this.height / 2;
                    this.vertices[(xx * 2 + yy) * 2] = xPos;
                    this.vertices[(xx * 2 + yy) * 2 + 1] = yPos;
                }
            }

            var indices = [0, 2, 1, 3, 2, 1];

            var shapeAttributes = {
                positions: { name: 'aPosition', itemSize: 2, data: this.vertices },
                indices: { name: 'indices', indexArray: true, data: new Uint16Array(indices) }
            };

            this.shapeVao = this.gl.createVertexArray();
            this.gl.bindVertexArray(this.shapeVao);

            this.initializeAttributes(shapeAttributes);

            return indices.length;
        }
    }, {
        key: "updateRadius",
        value: function updateRadius(value) {
            if (value) this.rad = value;

            this.gl.bindVertexArray(this.shapeVao);
            this.attributes['positions'].updateData(this.vertices);
        }
    }, {
        key: "_updateUniforms",
        value: function _updateUniforms() {
            this.uniforms['uPosition'].set2f(this.x, this.y);
            this.uniforms['uWindow'].set2f(window.innerWidth, window.innerHeight);
            this.uniforms['uColor'].set3f(this._color.r, this._color.g, this._color.b);
        }
    }, {
        key: "update",
        value: function update() {
            var dt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1 / 60;

            this.time += dt;

            return this;
        }
    }, {
        key: "draw",
        value: function draw() {
            var gl = this.renderer.gl;

            gl.useProgram(this.program);
            gl.bindVertexArray(this.shapeVao);

            this._updateUniforms();

            gl.drawElements(gl.TRIANGLES, this.indiceLength, gl.UNSIGNED_SHORT, 0);
        }
    }, {
        key: "resize",
        value: function resize() {}
    }, {
        key: "color",
        set: function set(value) {
            this._colorStr = value;
            this._color.setStyle(this._colorStr);
        }
    }]);

    return Rectangle;
}(_Shape2.Shape);

},{"../math/Color":11,"../math/Vector2":16,"../math/Vector3":17,"./Shape":24,"glslify":2}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Shape = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Uniform = require('../core/Uniform');

var _Attribute = require('../core/Attribute');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('eventemitter3');

var Shape = exports.Shape = function (_EventEmitter) {
    _inherits(Shape, _EventEmitter);

    function Shape(params) {
        _classCallCheck(this, Shape);

        var _this = _possibleConstructorReturn(this, (Shape.__proto__ || Object.getPrototypeOf(Shape)).call(this));

        params = params || {};
        _this.uniforms = {};
        _this.attributes = {};
        try {
            _this.renderer = params.renderer;
            if (_this.renderer === undefined) {
                throw 'renderer is undefined.';
            }
        } catch (e) {
            console.error(e);
        }

        _this.gl = _this.renderer.gl;
        _this.program = _this.renderer.createProgram(params.vertexShaderSource, params.fragmentShaderSource, {
            transformFeedbackVaryingArray: params.transformFeedbackVaryingArray
        });

        _this._initializeUniforms();
        return _this;
    }

    _createClass(Shape, [{
        key: '_initializeUniforms',
        value: function _initializeUniforms() {
            var numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);

            for (var ii = 0; ii < numUniforms; ii++) {
                var uniformInfo = this.gl.getActiveUniform(this.program, ii);
                var uniformLocation = this.gl.getUniformLocation(this.program, uniformInfo.name);
                this.uniforms[uniformInfo.name] = new _Uniform.Uniform({ uniformInfo: uniformInfo, uniformLocation: uniformLocation, gl: this.gl });
            }
        }
    }, {
        key: 'initializeAttributes',
        value: function initializeAttributes(attributes) {
            for (var key in attributes) {
                this.attributes[key] = new _Attribute.Attribute({
                    gl: this.gl,
                    program: this.program,
                    itemSize: attributes[key].itemSize,
                    data: attributes[key].data,
                    name: attributes[key].name,
                    indexArray: attributes[key].indexArray
                });
                this.attributes[key].bind();
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            this.renderer.gl.useProgram(this.program);
        }
    }]);

    return Shape;
}(EventEmitter);

},{"../core/Attribute":4,"../core/Uniform":8,"eventemitter3":1}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Triangle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Shape2 = require("./Shape");

var _Vector = require("../math/Vector2");

var _Vector2 = require("../math/Vector3");

var _Color = require("../math/Color");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var glslify = require('glslify');

var Triangle = exports.Triangle = function (_Shape) {
    _inherits(Triangle, _Shape);

    function Triangle() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Triangle);

        var _this = _possibleConstructorReturn(this, (Triangle.__proto__ || Object.getPrototypeOf(Triangle)).call(this, {
            renderer: params.renderer,
            vertexShaderSource: glslify(["#version 300 es\n#define GLSLIFY 1\n\nin vec2 aPosition;\n\nuniform vec2 uWindow;\nuniform vec2 uPosition;\nuniform float uRotation;\n\nvoid main(){\n    float cosRot = cos(uRotation);\n    float sinRot = sin(uRotation);\n    mat3 m = mat3(\n        cosRot, sinRot, 0.0,\n        -sinRot, cosRot, 0.0,\n        0.0, 0.0, 1.0\n    );\n    vec3 shapePosition = vec3(aPosition, 1.0);\n    vec3 curShapePosition = m * shapePosition;\n\n    float xPos =   ( uPosition.x + curShapePosition.x ) / uWindow.x * 2.0 - 1.0;\n    float yPos = - ( uPosition.y + curShapePosition.y ) / uWindow.y * 2.0 + 1.0;\n\n    gl_Position = vec4(xPos, yPos, 0.0, 1.0);\n}"]).trim(),
            fragmentShaderSource: glslify(["#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\nuniform vec3 uColor;\n\nout vec4 outColor;\n\nvoid main() {\n  // Just set the output to a constant redish-purple\n  outColor = vec4(uColor, 1);\n}"]).trim()
        }));

        _this.time = 0;
        _this.x = params.x ? params.x : 200;
        _this.y = params.y ? params.y : 200;
        _this.rotation = 0;

        _this.pt0 = params.pt0 || new _Vector.Vector2();
        _this.pt1 = params.pt1 || new _Vector.Vector2();
        _this.pt2 = params.pt2 || new _Vector.Vector2();

        _this.ptArray = [_this.pt0, _this.pt1, _this.pt2];

        _this.center = _this.ptArray.reduce(function (accumulator, currentValue, currentIndex, array) {
            accumulator.x += currentValue.x;
            accumulator.y += currentValue.y;
            return accumulator;
        }, new _Vector.Vector2());

        _this._color = new _Color.Color();
        _this.colorVector3 = new _Vector2.Vector3();
        _this.color = params.color || '#ff0000';

        _this._createShape();

        _this.resize();
        return _this;
    }

    _createClass(Triangle, [{
        key: "_createShape",
        value: function _createShape() {
            var indices = [0, 1, 2];

            var position = [this.pt0.x, this.pt0.y, this.pt1.x, this.pt1.y, this.pt2.x, this.pt2.y];

            var shapeAttributes = {
                indices: { name: 'indices', indexArray: true, data: new Uint16Array(indices) },
                positions: { name: 'aPosition', itemSize: 2, data: new Float32Array(position) }
            };

            this.count = position.length / 2;

            this.shapeVao = this.gl.createVertexArray();
            this.gl.bindVertexArray(this.shapeVao);

            this.initializeAttributes(shapeAttributes);
        }
    }, {
        key: "updatePts",
        value: function updatePts() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            if (params.pt0) this.pt0 = params.pt0;
            if (params.pt1) this.pt1 = params.pt1;
            if (params.pt2) this.pt2 = params.pt2;

            this.gl.bindVertexArray(this.shapeVao);
            var pts = this.attributes['positions'].data;
            pts[0] = this.pt0.x;pts[1] = this.pt0.y;
            pts[2] = this.pt1.x;pts[3] = this.pt1.y;
            pts[4] = this.pt2.x;pts[5] = this.pt2.y;

            this.attributes['positions'].updateData(pts);
        }
    }, {
        key: "_updateUniforms",
        value: function _updateUniforms() {
            this.uniforms['uPosition'].set2f(this.x, this.y);
            this.uniforms['uColor'].set3f(this._color.r, this._color.g, this._color.b);
            this.uniforms['uWindow'].set2f(window.innerWidth, window.innerHeight);
            this.uniforms['uRotation'].set1f(this.rotation);
        }
    }, {
        key: "update",
        value: function update() {
            var dt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1 / 60;

            this.time += dt;

            this.x = window.innerWidth / 2; //window.innerWidth/2 + 100 * Math.cos(this.time );
            this.y = window.innerHeight / 2; //window.innerHeight/2 + 100 * Math.sin(this.time );

            return this;
        }
    }, {
        key: "draw",
        value: function draw() {
            var gl = this.renderer.gl;

            gl.useProgram(this.program);
            gl.bindVertexArray(this.shapeVao);

            this._updateUniforms();

            gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
        }
    }, {
        key: "resize",
        value: function resize() {}
    }, {
        key: "color",
        set: function set(value) {
            this._colorStr = value;
            this._color.setStyle(this._colorStr);

            this.colorVector3.set(this._color.r, this._color.g, this._color.b);
        },
        get: function get() {
            return this._colorStr;
        }
    }]);

    return Triangle;
}(_Shape2.Shape);

},{"../math/Color":11,"../math/Vector2":16,"../math/Vector3":17,"./Shape":24,"glslify":2}]},{},[10]);
