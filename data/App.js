(function(window) {
var app = {
	_api:{
		init:function(arg) {
			app.init.call(app,arg);
		}
	},
	anim:{
		time:{
			diff:0,
			last:Date.now(),
			now:Date.now()
		},
		frame:function(elem) {
			var tick = function(elem) {
				return window.requestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.webkitRequestAnimationFrame || 
				window.msRequestAnimationFrame || 
				function(elem) {
					setTimeout(elem,1000/60);
				}
			}();
			app.anim.time.now = Date.now();
			app.anim.time.diff = app.anim.time.now - app.anim.time.last;
			app.anim.time.last = app.anim.time.now;
			tick(elem);
		},
		render:function() {
			for(var i in app.entities.chars) {
				if(app.entities.chars[i].sprite) {
					app.canvas.ctx().save();
					app.canvas.ctx().translate(app.entities.chars[i].x,app.entities.chars[i].y);
					app.entities.chars[i].sprite.render(app.canvas.ctx());
					app.canvas.ctx().restore();
				}
			}
		},
		update:function() {
			for(var i in app.entities.chars) {
				if(app.entities.chars[i].sprite) app.entities.chars[i].sprite.update(app.anim.time.diff);
			}
		}
	},
	canvas:{
		_DOMObject:null,
		_DOMObjectContext:null,
		_DOMObjectHeight:0,
		_DOMObjectWidth:0,
		ctx:function() {
			if(!app.canvas._DOMObjectContext) app.canvas._DOMObjectContext = app.canvas._DOMObject.getContext("2d");
			return app.canvas._DOMObjectContext;
		},
		clear:function() {
			app.canvas.ctx().clearRect(0,0,app.canvas.width(),app.canvas.height());
		},
		get:function() {
			return app.canvas._DOMObject;
		},
		height:function(h) {
			if(h) app.canvas._DOMObjectHeight = h;
			else h = app.canvas._DOMObjectHeight;
			return h;
		},
		set:function(elem) {
			if(elem.parentNode.nodeName == "BODY") {
				app.canvas._DOMObjectHeight = elem.height = window.innerHeight;
				app.canvas._DOMObjectWidth = elem.width = window.innerWidth;
			} else {
				app.canvas._DOMObjectHeight = elem.height = elem.parentNode.clientHeight;
				app.canvas._DOMObjectWidth = elem.width = elem.parentNode.clientWidth;
			}
			app.canvas._DOMObject = elem;
		},
		width:function(w) {
			if(w) app.canvas._DOMObjectWidth = w;
			else w = app.canvas._DOMObjectWidth;
			return w;
		}
	},
	console:{
		logs:[],
		log:function(a,b) {
			logs.push(b);
		}
	},
	entities:{
		chars:{length:0}, ////--
		npcs:[],
		addChar:function(o) {
			var data = {
				frames:null,
				frequency:16,
				height:0,
				id:'player'+app.entities.chars.length,
				index:app.entities.chars.length,
				name:'undefined',
				pos:[0,0],
				speed:10,
				sprite:null,
				src:'data/char/sprite_armour_default.png',
				type:'player',
				width:0,
				x:0,
				y:0
			};
			var Sprite = function(url,size,speed,pos,frames,dir) {
				this._index = 0;
				this.dir = dir || 'hor'
				this.frames = frames;
				this.pos = pos || [0,0];
				this.size = size;
				this.speed = speed;
				this.reversed = false;
				this.run = false;
				this.src = url;
				this.render = function(ctx) {
					var max = this.frames.length;
					var idx = Math.floor(this._index);
					var frame = this.frames[idx % max];
					var x = this.pos[0];
					var y = this.pos[1];
					if(!this.run) {
						if(this.reversed) frame = Math.floor(app.resources.images[this.src].width / this.size[0])-1;
						else frame = 0;
					}
					if(this.dir == 'hor' || this.dir == 'horizontal') x += frame*this.size[0];
					else y += frame*this.size[1];
					ctx.drawImage(app.resources.images[this.src],x,y,this.size[0],this.size[1],app.canvas.width()/2-this.size[0]/2,app.canvas.height()/2-this.size[1]/2,this.size[0],this.size[1]);
				};
				this.update = function(dt) {
					this._index += this.speed*(dt/1000);
				};
			}
			if(typeof o == 'object') for(var i in o) data[i] = o[i];
			if(!data.frames && app.resources.images[data.src]) {
				var n = Math.floor(app.resources.images[data.src].width / data.width);
				data.frames = [];
				for(var i=0;i<n;i++) data.frames[i] = i;
			}
		//	data.sprite = new app.prototypes.Sprite(data.src,[data.width,data.height],data.frequency,data.pos,data.frames);
			data.sprite = new Sprite(data.src,[data.width,data.height],data.frequency,data.pos,data.frames);
			app.entities.chars[data.id] = data;
			app.entities.length++;
			return {
				mapInput:function(fn) {
					var nFn = fn.bind(app.entities.chars[data.id]);
					app.input.rules.push(nFn);
				}
			};
		},
		main:function() {
			return {
				frames:[0,1,2,3,4],
				frequency:13,
				height:100,
				id:'main',
				index:0,
				name:'undefined',
				pos:[0,200],
				speed:150,
				width:50,
				x:0,
				y:0
			}
		},
	},
	events:{
		keydown:[],
		keyup:[],
		resize:[],
		scroll:[]
	},
	init:function(canvas) {
		window.addEventListener('resize',function() {
			app.events.resize.forEach(function(event) {
				event.call();
			});
		});
		window.addEventListener('scroll',function() {
			app.events.scoll.forEach(function(event) {
				event.call();
			});
		});

		app.canvas.set(canvas);
		app.canvas.get().tabIndex = 1;
		app.canvas.get().focus();
		app.canvas.get().addEventListener('keydown',function(e) {
			app.events.keydown.forEach(function(fn) {
				fn.call(app,e);
			});
		});
		app.canvas.get().addEventListener('keyup',function(e) {
			app.events.keyup.forEach(function(fn) {
				fn.call(app,e);
			});
		});

		app.events.resize.push(function() {
			app.canvas.set(canvas);
		});
		app.events.keydown.push(function(e) {
			if(!app.input.key(e.keyCode)) app.input.keys.push(e.keyCode);
		});
		app.events.keyup.push(function(e) {
			if(app.input.key(e.keyCode)) app.input.keys.splice(app.input.keys.indexOf(e.keyCode),1);
		});

		app.resources.load(['data/char/sprite_armour_default.png'],function() {
			app.entities.addChar(app.entities.main()).mapInput(function() {
				if(app.input.key([40,38,37,39])) {
					this.sprite.run = true;
					this.sprite.reversed = false;
					if(app.input.key(40)) {
						this.sprite.pos[1] = 200;
						this.y += this.speed * (app.anim.time.diff/1000);
					} else if(app.input.key(38)) {
						this.sprite.pos[1] = 300;
						this.y -= this.speed * (app.anim.time.diff/1000);
					}

					if(app.input.key(37)) {
						this.sprite.pos[1] = 0;
						this.sprite.reversed = true;
						this.x -= this.speed * (app.anim.time.diff/1000);
					} else if(app.input.key(39)) {
						this.sprite.pos[1] = 100;
						this.x += this.speed * (app.anim.time.diff/1000);
					}
				} else this.sprite.run = false;
			});

			app.socket.connect(io);
			app.main();
		});
	},
	input:{
		keys:[],
		key:function(key,flag) {
			var r = false;
			if(key instanceof Array) {
				key.forEach(function(k) {
					if(flag) {
						r = true;
						if(app.input.keys.indexOf(k) == -1) r = false;
					} else if(app.input.keys.indexOf(k) != -1) r = true;
				});
			} else if(app.input.keys.indexOf(key) != -1) r = true;
			return r;
		},
		rules:[]
	},
	main:function() {
	//	if(app.anim.time.diff % 6 > 4) console.log(app.input.keys);
		app.canvas.clear();
		app.anim.render();
		app.anim.update();
		app.input.rules.forEach(function(fn) {
			fn.call();
		});
		app.anim.frame(app.main);
	},
	prototypes:{
		Sprite:function(url,size,speed,pos,frames,dir,canvas) {
			this._index = 0;
			this.canvas = canvas || app.canvas.get();
			this.dir = dir || 'hor'
			this.frames = frames;
			this.pos = pos || [0,0];
			this.size = size;
			this.speed = speed;
			this.reversed = false;
			this.run = false;
			this.src = url;
			this.render = function(ctx) {
				var max = this.frames.length;
				var idx = Math.floor(this._index);
				var frame = this.frames[idx % max];
				var x = this.pos[0];
				var y = this.pos[1];
				if(!this.run) {
					if(this.reversed) frame = Math.floor(app.resources.images[this.src].width / this.size[0])-1;
					else frame = 0;
				}
				if(this.dir == 'hor' || this.dir == 'horizontal') x += frame*this.size[0];
				else y += frame*this.size[1];
				ctx.drawImage(app.resources.images[this.src],x,y,this.size[0],this.size[1],app.canvas.width()/2-this.size[0]/2,app.canvas.height()/2-this.size[1]/2,this.size[0],this.size[1]);
			},
			this.update = function(dt) {
				this._index += this.speed*(dt/1000);
			}
		}
	},
	resources:{
		images:{},
		sounds:{},
		load:function(kind,url,fn) {
			if(typeof url == 'function') {
				fn = url;
				url = kind;
				kind = 'image';
			}
			if(kind == 'image') {
				if(url instanceof Array) {
					var parsed = 0;
					url.forEach(function(src) {
						app.resources.images[src] = new Image();
						app.resources.images[src].src = src;
						app.resources.images[src].addEventListener('load',function() {
							parsed++;
							callback();
						});
						app.resources.images[src].addEventListener('error',function(e) {
							parsed++;
							app.console.log("Error","Could not load image with url <"+src+">\n\tResponse: ("+e+").");
							callback();
						});
					});
					function callback() {
						if(parsed == url.length) fn.call();
					}
				} else {
					app.resources.images[url] = new Image();
					app.resources.images[url].src = url;
					app.resources.images[url].addEventListener('load',function() {
						fn.call(this);
					});
					app.resources.images[url].addEventListener('error',function(e) {
						app.console.log("Error","Could not load image with url <"+url+">\n\tResponse: ("+e+").");
					});
				}
			} else if(kind == 'sound') {
				//TODO: implement sound resource loading
			}
		}
	},
	socket:{
		io:null,
		online:false,
		port:8000,
		server:'http://localhost',
		sockets:[],
		connect:function(io) {
			app.socket.io = io.connect(app.socket.server+':'+app.socket.port);
			app.socket.io.on('welcome',function(res) {
				var pData = {};
				for(var i in app.entities.chars) {
					pData[i] = app.entities.chars[i];
				}
				app.socket.online = true;
				app.socket.io.emit('player_data',app.entities.chars['main']);
				
				app.socket.io.emit('request','player_data');
			});
			app.socket.io.on('player_data',function(res) {
				if(res.data instanceof Array) {
					res.data.forEach(function(player) {
						app.entities.chars.push(player);
					});
				}
			});
		}
	}
};

window.App = app._api;
})(window);