/*!
 *  Project: LED
 *  Description: canvas粒子文字插件
 *  Version : 1.0.0.20150810
 *  Author: Lixinliang
 *  License:
 *  Include:
 */
!function ( global, factory ) {
    var plugin = 'LED';
    if (typeof define == 'function') {
        define(plugin, function(){
            return factory()
        })
    } else {
        global[plugin] = factory();
    }
}(this, function(){
	if (!document.querySelector) {
		console&&console.error&&console.error('Your browser is not supported');
		return
	}
	var $ = window.$||window.jQuery||window.Zepto;
	if (typeof $ == 'undefined') {
		var $$ = function ( target ) {
			this[0] = target;
			this.length = 1;
		}
		$$.prototype = {
			splice : Array.prototype.splice,
			on : function ( event, callback ) {
				this[0].addEventListener(event, callback, false);
			},
			off : function ( event, callback ) {
				this[0].removeEventListener(event, callback, false);
			}
		}
		$ = function ( selector ) {
			if (typeof selector == 'string') {
				return new $$(document.querySelector(selector))
			} else if (typeof selector == 'object') {
				if (selector === selector.window) {
					return new $$(selector)
				} else if (selector.nodeType) {
					return new $$(selector)
				} else if (selector[0]&&selector[0].nodeType) {
					return new $$(selector[0])
				}
			}
		}
		$.extend = function(){
			var target = arguments[0];
			target = typeof target == 'object' ? target : {};
			var length = arguments.length;
			for (var i = 1; i < length; i++ ) {
				var temp = arguments[i];
				for ( var name in temp) {
					target[name] = temp[name];
				}
			}
			return target
		}
	}

	var S = {};
	S.init = function ( fn ) {
		var self = this;
		this.drawing.adjustCanvas();
		fn();
		this.drawing.loop(function () {
			return self.destroyed || (self.shape.render())
		});
	}
	S.Drawing = {
		loop : function ( fn ) {
			this.renderFn = !this.renderFn ? fn : this.renderFn;
			this.clearFrame();
			if (!this.renderFn()) {
				this.requestFrame.call(window, this.loop.bind(this, fn));
			}
		},
		adjustCanvas : function(){
			this.canvas.width = this.canvas.style.width = this.self.config.width;
			this.canvas.height = this.canvas.style.height = this.self.config.height;
		},
		clearFrame : function () {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},
		getArea : function () {
			return {
				w: this.canvas.width,
				h: this.canvas.height
			}
		},
		drawCircle : function ( p, c ) {
			this.context.fillStyle = c.render();
			this.context.beginPath();
			this.context.arc(p.x, p.y, p.z, 0, 2 * Math.PI, true);
			this.context.closePath();
			this.context.fill();
		}
	};
	S.Command = {
		extend : function ( conf ) {
			if (typeof conf == 'object') {
				for (var i in conf) {
					if (i != 'extend') {
						S.Command[i] = conf[i];
					}
				}
			}
			return this
		}
	}
	S.Core = (function(){
		function formatTime ( date ) {
			var h = date.getHours();
			var m = date.getMinutes();
			m = m < 10 ? '0' + m : m;
			return h + ':' + m;
		}
		function getValue ( value, partition ) {
			return value && (function(){
				var ret = value.split(partition);
				ret.shift();
				return ret.join('')
			})()
		}
		function getAction ( value, command, partition ) {
			value = value && value.split(partition)[0];
			return value && value.substring(0, command.length) === command && value.substring(command.length)
		}
		function reset(){
			clearTimeout(this.timerId);
			this.sequence = [];
		}
		function clear(){
			this.shape.switchShape(this.shapeBuilder.letter(''));
		}
		function performAction ( act ) {
			var config = this.self.config;
			this.sequence = typeof act == 'object' ? act : this.sequence.concat((function(){
				var ret = [];
				var temp = act.split(config.split);
				var len = temp.length;
				var last = temp[len - 1];
				temp.forEach(function ( action , index ) {
					if (action) {
						ret.push(action);
					}
				})
				if (ret.length > 0 && last === '') {
					ret.push(last);
				}
				return ret
			})());
		}
		function timedAction ( callback ) {
			if (this.destroyed) {
				return
			}
			var config = this.self.config;
			var sequence = this.sequence;
			if (sequence.length <= 0) {
				return
			}
			var current = sequence.shift() || '';
			var action = getAction(current, config.command, config.partition);
			var value = getValue(current, config.partition);
			var SCmd = S.Command;
			var command = {
				current : current,
				action : action,
				value : value
			};
			var thisCommand = (SCmd.hasOwnProperty(action)&&typeof SCmd[action]=='function') ? action : 'default';
			this.stopTrigger = false;
			SCmd[thisCommand].call(this, command);
			this.stopTrigger||(callback.call(this, command));
			this.prevCommand = thisCommand;
			this.timerId = setTimeout(timedAction.bind(this, callback), this.speed);
		}
		S.Command.extend({
			count : function ( command ) {
				var value = command.value.replace(/\s+/g,'');
				var config = this.self.config;
				var number = value.split(/from|to/);
				var from;
				var to;
				if (number.length == 1) {
					from = parseInt(number[0]);
					to = config.maxCount;
				} else if (number.length == 2) {
					if (/from/.test(value)) {
						from = parseInt(number[1]);
						to = config.maxCount;
					} else {
						from = config.minCount;
						to = parseInt(number[1]);
					}
				} else if (number.length == 3) {
					if (value.indexOf('from') < value.indexOf('to')) {
						from = parseInt(number[1]);
						to = parseInt(number[2]);
					} else {
						from = parseInt(number[2]);
						to = parseInt(number[1]);
					}
				} else {
					from = parseInt(value);
					to = config.maxCount;
				}
				from = isNaN(from) ? config.minCount : from < 0 ? config.minCount : from;
				to = isNaN(to) ? config.maxCount : to < 0 ? config.maxCount : to;
				if (from < to) {
					this.shape.switchShape(this.shapeBuilder.letter(from), true);
					this.sequence.unshift(config.command+'count'+config.partition+'from'+(from+1)+'to'+to);
				} else if (from > to) {
					this.shape.switchShape(this.shapeBuilder.letter(config.error));
					if (this.sequence.length == 0) {
						this.sequence.unshift(' ');
					}
				} else {
					this.shape.switchShape(this.shapeBuilder.letter(from), true);
					if (this.sequence.length == 0) {
						this.sequence.unshift(' ');
					}
				}
				this.speed = this.getNextCommand() == 'count' ? config.countSpeed : config.speed;
			},
			countdown : function ( command ) {
				var value = command.value.replace(/\s+/g,'');
				var config = this.self.config;
				var number = value.split(/from|to/);
				var from;
				var to;
				if (number.length == 1) {
					from = parseInt(number[0]);
					to = config.minCount;
				} else if (number.length == 2) {
					if (/from/.test(value)) {
						from = parseInt(number[1]);
						to = config.minCount;
					} else {
						from = config.maxCount;
						to = parseInt(number[1]);
					}
				} else if (number.length == 3) {
					if (value.indexOf('from') < value.indexOf('to')) {
						from = parseInt(number[1]);
						to = parseInt(number[2]);
					} else {
						from = parseInt(number[2]);
						to = parseInt(number[1]);
					}
				} else {
					from = parseInt(value);
					to = config.minCount;
				}
				from = isNaN(from) ? config.maxCount : from < 0 ? config.maxCount : from;
				to = isNaN(to) ? config.minCount : to < 0 ? config.minCount : to;
				if (from > to) {
					this.shape.switchShape(this.shapeBuilder.letter(from), true);
					this.sequence.unshift(config.command+'countdown'+config.partition+'from'+(from-1)+'to'+to);
				} else if (from < to) {
					this.shape.switchShape(this.shapeBuilder.letter(config.error));
					if (this.sequence.length == 0) {
						this.sequence.unshift(' ');
					}
				} else {
					this.shape.switchShape(this.shapeBuilder.letter(from), true);
					if (this.sequence.length == 0) {
						this.sequence.unshift(' ');
					}
				}
				this.speed = this.getNextCommand() == 'countdown' ? config.countSpeed : config.speed;
			},
			rectangle : function ( command ) {
				var value = command.value;
				var config = this.self.config;
				value = value && value.split('x');
				value = typeof value =='object' ? value : [];
				var width = parseInt(value[0]) || config.rectangleWidth;
				var height = parseInt(value[1]) || config.rectangleHeight;
				width = width < 0 ? config.rectangleWidth : Math.min(config.maxShapeSize, width);
				height = height < 0 ? config.rectangleHeight : Math.min(config.maxShapeSize, height);
				this.shape.switchShape(this.shapeBuilder.rectangle(width, height));
			},
			circle : function ( command ) {
				var value = command.value;
				var config = this.self.config;
				value = parseInt(value) || config.circleRadius;
				value = value < 0 ? config.circleRadius : Math.min(value, config.maxShapeSize);
				this.shape.switchShape(this.shapeBuilder.circle(value));
			},
			time : function ( command ) {
				var value = command.value;
				var config = this.self.config;
				var t;
				if (typeof config.formatTime == 'function') {
					t = config.formatTime(new Date());
					if (typeof t != 'string') {
						t = formatTime(new Date());
					}
				} else {
					t = formatTime(new Date());
				}
				if (this.prevCommand == 'time') {
					if (this.lasttime != t) {
						this.shape.switchShape(this.shapeBuilder.letter(t), true, true);
					} else {
						this.stopTrigger = true;
					}
				} else {
					this.shape.switchShape(this.shapeBuilder.letter(t));
				}
				this.lasttime = t;
				if (this.sequence.length == 0) {
					this.sequence.unshift(config.command+'time');
				}
				this.speed = this.getNextCommand() == 'time' ? config.timeSpeed : config.speed;
			},
			icon : function ( command ) {
				var value = command.value;
				var config = this.self.config;
				var self = this;
				this.shapeBuilder.imageFile(config.imgUrl+value+config.imgType, function ( img ) {
					self.shape.switchShape(img);
				})
			},
			default : function ( command ) {
				var current = command.current;
				var config = this.self.config;
				this.shape.switchShape(this.shapeBuilder.letter(current.indexOf(config.command) == 0 ? config.error : current));
			}
		});
		return {
			simulate : function ( action, callback ) {
				reset.call(this);
				performAction.call(this, action);
				timedAction.call(this, callback);
			},
			reset : function(){
				reset.call(this);
			},
			clear : function(){
				clear.call(this);
			}
		}
	}());
	S.Point = function ( args ) {
		this.x = args.x;
		this.y = args.y;
		this.z = args.z;
		this.a = args.a;
		this.h = args.h;
	};
	S.Color = function ( r, g, b, a ) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	};
	S.Color.prototype = {
		render: function(){
			return ['rgba(',this.r,',',this.g,',',this.b,',',this.a,')'].join('')
		}
	};
	S.Dot = function ( x, y, color ) {
		this.p = new S.Point({
			x: x,
			y: y,
			z: 5,
			a: color.a,
			h: 0
		});
		this.e = 0.07;
		this.s = true;

		this.c = new S.Color(color.r, color.g, color.b, this.p.a);

		this.t = this.clone();
		this.q = [];
	};
	S.Dot.prototype = {
		clone: function(){
			return new S.Point({
				x: this.x,
				y: this.y,
				z: this.z,
				a: this.a,
				h: this.h
			});
		},
		_draw: function ( drawing ){
			this.c.a = this.p.a;
			S.Drawing.drawCircle.call(drawing, this.p, this.c);
		},
		_moveTowards: function ( n ) {
			var details = this.distanceTo(n, true);
			var dx = details[0];
			var dy = details[1];
			var d = details[2];
			var e = this.e * d;
			if (this.p.h === -1) {
				this.p.x = n.x;
				this.p.y = n.y;
				return true;
			}
			if (d > 1) {
				this.p.x -= ((dx / d) * e);
				this.p.y -= ((dy / d) * e);
			} else {
				if (this.p.h > 0) {
					this.p.h--;
				} else {
					return true;
				}
			}
			return false;
		},
		_update: function(){
			if (this._moveTowards(this.t)) {
				var p = this.q.shift();
				if (p) {
					this.t.x = p.x || this.p.x;
					this.t.y = p.y || this.p.y;
					this.t.z = p.z || this.p.z;
					this.t.a = p.a || this.p.a;
					this.p.h = p.h || 0;
				} else {
					if (this.s) {
						this.p.x -= Math.sin(Math.random() * 3.142);
						this.p.y -= Math.sin(Math.random() * 3.142);
					} else {
						this.move(new S.Point({
							x: this.p.x + (Math.random() * 50) - 25,
							y: this.p.y + (Math.random() * 50) - 25
						}));
					}
				}
			}
			d = this.p.a - this.t.a;
			this.p.a = Math.max(0.1, this.p.a - (d * 0.05));
			d = this.p.z - this.t.z;
			this.p.z = Math.max(1, this.p.z - (d * 0.05));
		},
		distanceTo: function ( n, details ) {
			var dx = this.p.x - n.x;
			var dy = this.p.y - n.y;
			var d = Math.sqrt(dx * dx + dy * dy);
			return details ? [dx, dy, d] : d;
		},
		move: function ( p, avoidStatic ) {
			if (!avoidStatic || (avoidStatic && this.distanceTo(p) > 1)) {
				this.q.push(p);
			}
		},
		render: function ( engine ) {
			this._update();
			this._draw( engine.drawing );
		}
	}
	S.ShapeBuilder = {
		_fit : function(){
			var config = this.self.config;
			var canvas = this.shapeCanvas;
			var context = this.shapeContext;
			canvas.width = Math.floor(this.self.engine.drawing.canvas.width/this.gap) * this.gap;
			canvas.height = Math.floor(this.self.engine.drawing.canvas.height/this.gap) * this.gap;
			context.fillStyle = 'red';
			context.textBaseline = 'middle';
			context.textAlign = 'center';
		},
		processCanvas : function(){
			var pixels = this.shapeContext.getImageData(0, 0, this.shapeCanvas.width, this.shapeCanvas.height).data;
			var dots = [];
			var pixels;
			var x = 0;
			var y = 0;
			var fx = this.shapeCanvas.width;
			var fy = this.shapeCanvas.height;
			var w = 0;
			var h = 0;
			for (var p = 0; p < pixels.length; p += (4 * this.gap)) {
				if (pixels[p + 3] > 0) {
					dots.push(new S.Point({
						x: x,
						y: y
					}));
					w = x > w ? x : w;
					h = y > h ? y : h;
					fx = x < fx ? x : fx;
					fy = y < fy ? y : fy;
				}
				x += this.gap;
				if (x >= this.shapeCanvas.width) {
					x = 0;
					y += this.gap;
					p += this.gap * 4 * this.shapeCanvas.width;
				}
			}
			return {
				dots: dots,
				w: w + fx,
				h: h + fy
			}
		},
		setFontSize : function ( s ) {
			this.shapeContext.font = 'bold ' + s + 'px ' + this.fontFamily;
		},
		isNumber : function  ( n ) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		},
		init : function(){
			this.fit();
			$(window).on('resize', this.fit);
		},
		destroy : function(){
			$(window).off('resize', this.fit);
		},
		letter : function ( l ) {
			var s = 0;
			this.setFontSize(this.fontSize);
			s = Math.min(this.fontSize,
			(this.shapeCanvas.width / this.shapeContext.measureText(l).width) * 0.8 * this.fontSize,
			(this.shapeCanvas.height) * (this.isNumber(l) ? 0.9 : 0.75));
			this.setFontSize(s);
			this.shapeContext.clearRect(0, 0, this.shapeCanvas.width, this.shapeCanvas.height);
			this.shapeContext.fillText(l, this.shapeCanvas.width / 2, this.shapeCanvas.height / 2);
			return this.processCanvas();
		},
		rectangle : function ( w, h ) {
			var dots = [];
			var width = this.gap * w;
			var height = this.gap * h;
			for (var y = 0; y < height; y += this.gap) {
				for (var x = 0; x < width; x += this.gap) {
					dots.push(new S.Point({
						x: x,
						y: y,
					})
				)
				}
			}
			return {
				dots: dots,
				w: width,
				h: height
			}
		},
		circle : function ( d ) {
			var r = Math.max(0, d) / 2;
			this.shapeContext.clearRect(0, 0, this.shapeCanvas.width, this.shapeCanvas.height);
			this.shapeContext.beginPath();
			this.shapeContext.arc(r * this.gap, r * this.gap, r * this.gap, 0, 2 * Math.PI, false);
			this.shapeContext.fill();
			this.shapeContext.closePath();
			return this.processCanvas();
		},
		imageFile : function ( url, callback ) {
			var image = new Image;
			var a = this.self.engine.drawing.getArea();
			var self = this;
			var config = this.self.config;
			image.onload = function () {
				self.shapeContext.clearRect(0, 0, self.shapeCanvas.width, self.shapeCanvas.height);
				var cvsRatio = a.w/a.h;
				var imgRatio = this.width/this.height;
				var w;
				var h;
				if (imgRatio > cvsRatio) {
					w = a.w;
					h = a.w / imgRatio;
				} else {
					w = a.h * imgRatio
					h = a.h;
				}
				w = parseInt(w) * 0.9;
				h = parseInt(h) * 0.9;
				self.shapeContext.drawImage(this, 0, 0, w, h);
				callback(self.processCanvas());
			}
			image.onerror = function () {
				callback(self.self.engine.shapeBuilder.letter(config.error));
			}
			image.src = url;
		}
	}
	S.Shape = {
		compensate : function(){
			var a = this.self.engine.drawing.getArea();
			this.cx = a.w / 2 - this.width / 2;
			this.cy = a.h / 2 - this.height / 2;
		},
		shuffleIdle : function(){
			var a = this.self.engine.drawing.getArea();
			for (var d = 0; d < this.dots.length; d++) {
				if (!this.dots[d].s) {
					this.dots[d].move({
						x: Math.random() * a.w,
						y: Math.random() * a.h
					});
				}
			}
		},
		switchShape : function ( n, fast, differOnly ) {
			if (differOnly) {
				// do nothing
			}
			var size;
			var a = this.self.engine.drawing.getArea();
			var config = this.self.config;
			this.width = n.w;
			this.height = n.h;
			this.compensate();
			if (n.dots.length > this.dots.length) {
				size = n.dots.length - this.dots.length;
				for (var d = 1; d <= size; d++) {
					this.dots.push(new S.Dot(a.w / 2, a.h / 2, config.pointColor));
				}
			}
			var d = 0;
			var i = 0;
			while (n.dots.length > 0) {
				i = Math.floor(Math.random() * n.dots.length);
				this.dots[d].e = fast ? 0.25 : (this.dots[d].s ? 0.14 : 0.11);

				if (this.dots[d].s) {
					this.dots[d].move(new S.Point({
						z: Math.random() * 20 + 10,
						a: Math.random(),
						h: 18
					}));
				} else {
					this.dots[d].move(new S.Point({
						z: Math.random() * 5 + 5,
						h: fast ? 18 : 30
					}));
				}
				this.dots[d].s = true;
				this.dots[d].move(new S.Point({
					x: n.dots[i].x + this.cx,
					y: n.dots[i].y + this.cy,
					a: config.shapeOpactiy,
					z: 5,
					h: 0
				}));

				n.dots = n.dots.slice(0, i).concat(n.dots.slice(i + 1));
				d++;
			}
			for (var i = d; i < this.dots.length; i++) {
				if (this.dots[i].s) {
					this.dots[i].move(new S.Point({
						z: Math.random() * 20 + 10,
						a: Math.random(),
						h: 20
					}));
					this.dots[i].s = false;
					this.dots[i].e = 0.04;
					this.dots[i].move(new S.Point({
						x: Math.random() * a.w,
						y: Math.random() * a.h,
						a: config.pointColor.a,
						z: Math.random() * 4,
						h: 0
					}));
				}
			}
		},
		render : function(){
			for (var d = 0; d < this.dots.length; d++) {
				this.dots[d].render(this.self.engine);
			}
		}
	}

	var defaults = {
		content         : $('[data-role=led-content]')[0],
		width           : window.innerWidth,
		height          : window.innerHeight,
		split           : '|',
		command         : '#',
		partition       : ' ',
		error           : 'What?',
		action          : 'hello',
		keyword         : 'led',
		minCount        : 1,
		maxCount        : 10,
		maxShapeSize    : 30,
		rectangleWidth  : 30,
		rectangleHeight : 15,
		circleRadius    : 18,
		formatTime      : function ( date ) {
							var h = date.getHours();
							var m = date.getMinutes();
							m = m < 10 ? '0' + m : m;
							return h + ':' + m
						},
		imgUrl          : '/img/icon/',
		imgType         : '.png',
		speed           : 2000,
		countSpeed      : 1000,
		timeSpeed       : 1000,
		gap             : 13,
		fontSize        : 1000,
		fontFamily      : 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif',
		pointColor      : {
							r : 255,
							g : 102,
							b : 51,
							a : 0.3
						},
		shapeOpactiy    : 0.9
	}
	var SS = function ( self ) {
		this.self = self;
		this.sequence = [];
		this.timerId = 0;
		this.speed = self.config.speed;
		this.prevCommand;
		this.destroyed = false;
		this.drawing = new SDrawing(self);
		this.shapeBuilder = new SShapeBuilder(self);
		this.shape = new SShape(self);
	}
	SS.prototype = S;
	SS.prototype.getNextCommand = function(){
		return this.sequence.length > 0&&this.sequence[0].split(this.self.config.partition).shift().split(this.self.config.command).pop()
	}
	var SDrawing = function ( self ) {
		this.self = self;
		this.canvas = self.config.content;
		this.context = this.canvas.getContext('2d');
		this.requestFrame = window.requestAnimationFrame
			||window.webkitRequestAnimationFrame
			||window.mozRequestAnimationFrame
			||window.oRequestAnimationFrame
			||window.msRequestAnimationFrame
			||(function ( callback ) {
				window.setTimeout(callback, 1000 / 60);
			});
	}
	SDrawing.prototype = S.Drawing;
	var SShapeBuilder = function ( self ) {
		this.self = self;
		this.shapeCanvas = document.createElement('canvas');
		this.shapeContext = this.shapeCanvas.getContext('2d');
		this.gap = self.config.gap;
		this.fontSize = self.config.fontSize;
		this.fontFamily = self.config.fontFamily;
		this.fit = this._fit.bind(this);
	}
	SShapeBuilder.prototype = S.ShapeBuilder;
	var SShape = function ( self ) {
		this.self = self;
		this.dots = [];
		this.width = 0;
		this.height = 0;
		this.cx = 0;
		this.cy = 0;
	}
	SShape.prototype = S.Shape;
	var e = {};
	function LED ( conf ) {
		this.self = this;
		this.config = conf;
		this.stoped = false;
	}
	LED.prototype = {
		init : function(){
			this.engine = new SS(this);
			this.engine.init(function(){
				this.engine.shapeBuilder.init();
				this.trigger('init');
				if (this.config.action !== false) {
					var ret;
					window.location.search.substring(1).split('&').forEach(function ( kw ) {
						if (kw.split('=').shift() === this.config.keyword) {
							this.simulate(decodeURI(kw.split('=').pop()));
							ret = true;
							return
						}
					}.bind(this));
					if (!ret) {
						this.simulate(this.config.action);
					};
				}
			}.bind(this));
			return this
		},
		render : function ( width, height ) {
			this.config.width = width;
			this.config.height = height;
			this.engine.drawing.adjustCanvas();
			return this
		},
		simulate : function ( action ) {
			if (this.stoped !== false) {
				this.stoped = false
			}
			this.engine.Core.simulate.call(this.engine, action, function ( command ) {
				this.trigger('action', command);
			}.bind(this));
			return this
		},
		reset : function(){
			this.engine.Core.reset.call(this.engine);
			if (this.stoped !== false) {
				this.stoped = [];
			}
			return this
		},
		clear : function(){
			this.engine.Core.clear.call(this.engine);
			return this
		},
		stop : function(){
			if (this.stoped === false) {
				this.stoped = $.extend([], this.engine.sequence);
				this.reset();
			}
		},
		start : function(){
			if (this.stoped !== false) {
				this.simulate(this.stoped);
				this.stoped = false;
			}
		},
		destroy : function(){
			this.engine.shapeBuilder.destroy();
			this.engine.destroyed = true;
			this.engine = undefined;
			return this
		},
		shuffle : function(){
			this.engine.shape.shuffleIdle();
			return this
		},
		on : function ( event, fn ) {
			if (!e[event]) {
				e[event] = [];
			}
			if (typeof fn == 'function') {
				e[event].push(fn)
			};
			return this
		},
		off : function ( event, fn ) {
			if (!e[event]) {
				return this
			}
			for (var i = e[event].length - 1; i >= 0; i--) {
				if (e[event][i] === fn) {
					e[event].splice(i, 1);
				}
			}
			return this
		},
		trigger : function ( event ) {
			var args = Array.prototype.splice.call(arguments, 1);
			var self = this;
			if (!e[event]) {
				return this
			}
			e[event].forEach(function ( i ) {
				i.apply(self, args);
			})
			return this
		}
	}
	return function ( conf ) {
		if (document.createElement('canvas').getContext) {
			return new LED($.extend({}, defaults, conf))
		}
	}
});