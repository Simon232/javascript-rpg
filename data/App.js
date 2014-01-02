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

		}
	},
	canvas:{
		_DOMObject:null,
		_DOMObjectHeight:0,
		_DOMObjectWidth:0,
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
	entities:{
		chars:[],
		npcs:[],
		addChar:function() {
			app.entities.chars.push({
			//	sprite:new app.prototypes.Sprite();
			});
		},
		addNpc:function() {

		}
	},
	events:{
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
			app.events.scoll.forEach(function() {
				event.call();
			});
		});

		app.canvas.set(canvas);
		app.events.resize.push(function() {
			app.canvas.set(canvas);
		});

		app.entities.addChar();

		app.main();
	},
	main:function() {
		app.anim.render();
		app.anim.frame(app.main);
	},
	prototypes:{
		Entity:function(a,b,c,d,e) {
			
		},
		Sprite:function(url,size,speed,frames,dir,canvas) {
			this._index = 0;
			this.canvas = canvas || app.canvas.get();
			this.dir = dir || 'hor'
			this.frames = frames;
			this.pos = pos || [0,0];
			this.size = size;
			this.speed = speed;
			this.reversed = false;
			this.run = true;
			this.src = url;
			this.render = function(ctx) {
				var max = this.frames.length;
				var idx = Math.floor(this._index);
				var frame = this.frames[idx % max];
				var x = this.pos[0];
				var y = this.pos[1];
				if(!this.run) {
					if(this.reversed) frame = this.frames.length-1;
					else frame = 0;
				}
				if(this.dir == 'hor' || this.dir == 'horizontal') x += frame*this.size[0];
				else y += frame*this.size[1];
				ctx.drawImage(app.resources[this.src],x,y,this.size[0],this.size[1],0,0,this.size[0],this.size[1]);
			},
			this.update = function(dt) {
				this._index += this.speed*dt;
			}
		}
	},
	resources:{}
};

window.App = app._api;
})(window);