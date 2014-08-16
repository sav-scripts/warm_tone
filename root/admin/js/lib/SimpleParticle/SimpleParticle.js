(function(){
"use strict";

var savpts = window.savpts = {};

savpts.Rectangle = function(x,y,width,height)
{
	var _p = savpts.Rectangle.prototype = this;
	this.x = x; this.y = y; this.width = width; this.height = height;
	this.left = x; this.top = y; this.right = x + width; this.bottom = y + height;
};

savpts.Circle = function(x, y, radius)
{
	var _p = savpts.Circle.prototype = this;
	this.x = x; this.y = y; this.radius = radius;
};

savpts.Point = function(x,y)
{
	var _p = savpts.Point.prototype = this;
	this.x = x; this.y = y;
	this.toString = function(){ return "("+_p.x+", "+_p.y+")"; };
};

savpts.Emitter = function(delay, popPointList, popInOrder)
{
	var _p = savpts.Emitter.prototype = this;
	
	this.delay = delay != null? delay: 33;
	
	var _popPointList = (popPointList != null)? popPointList.slice(0): null;
	var _popInOrder = popInOrder;
	
	this.popPointList = _popPointList;
	
	var _playing = false;
	
	var totalWeight = 0;
	
	this.numParticles = 0;
	this.numBurstPlayed = 0;
	this.numBurstMax = 0;
	
	this.dom = document.createElement("div");
	this.dom.className = "savpts_emitter";
	
	
	var _totalParticleWeight = 0;
	var _particleIndex = 0;
	var _particleInstanceList = [];
	
	var _particleList = this.particleList = [];
	
	this.addParticle = function(particle, weight, clearAll)
	{
        if(clearAll)
        {
            _totalParticleWeight = 0;
            _particleIndex = 0;
            _particleList = _p.particleList = [];
            _particleInstanceList = [];
        }

		if(weight == null) weight = 1;
		var defineObj = {particle:particle, weight:weight };
		_particleList.push(defineObj);
		
		_totalParticleWeight += weight;
		if(_particleList.length == 1 || _totalParticleWeight <= _particleList.length) _particleInstanceList.push(defineObj.particle);
		else{
			_particleInstanceList = [];
			var i, n = _particleList.length;
			for(i=0;i<n;i++)
			{
				defineObj = _particleList[i];
				for(var k=0;k<defineObj.weight;k++){ _particleInstanceList.push(defineObj.particle); }
			}
			
			_particleInstanceList = shuffleArray(_particleInstanceList);
		}
	};
	
	this.start = function(delay)
	{
		if(delay) _p.delay = delay;
		_p.maxParticles = null;
		_p.numBurstPlayed = 0;
		_p.numBurstMax = 0;
		_playing = true;
		createParticle();
	};
	
	this.burst = function(numParticles, delay)
	{
		if(delay != null) _p.delay = delay;
		_p.numBurstPlayed = 0;
		_p.numBurstMax = numParticles;
		_playing = true;
		createParticle();
	};
	
	this.stop = function()
	{
		_playing = false;
	};
	
	function createParticle()
	{
		if(!_playing) return;
		
		var ptClass = _particleInstanceList[_particleIndex];
		var dom = ptClass.createInstance()
		_p.dom.appendChild(dom);
		
		_p.numParticles ++;
		_p.numBurstPlayed ++;
		
		var actionList = ptClass.actionList;
		
		var tl = new TimelineMax();
		var i, n = actionList.length, s, point, duration;
		
		for(i=0;i<n;i++)
		{
			s = actionList[i];
			var tweenParams = s.getTweenParams();
			if(i==0 && _popPointList)
			{
				if(_popInOrder){ point = _popPointList.shift(); _popPointList.push(point); }
				else point = _popPointList[(_popPointList.length*Math.random())<<0];
				tweenParams.left = tweenParams.left? tweenParams.left + point.x: point.x;
				tweenParams.top = tweenParams.top? tweenParams.top + point.y: point.y;
			}
			duration = (s.deltaDuration)? s.duration + (Math.random()*s.deltaDuration): s.duration;
			tl.to(dom, duration, tweenParams, s.position);
		}
		
		tl.to(dom, 0, {onComplete:function()
		{
			_p.numParticles --;
			_p.dom.removeChild(dom);
		}});
		
		_particleIndex ++;
		if(_particleIndex >= _particleInstanceList.length) _particleIndex = 0;
		
		if(_p.numBurstMax != 0 && _p.numBurstPlayed >= _p.numBurstMax) return;
		setTimeout(createParticle, _p.delay);
	};
};

savpts.EmitterArea = function(gap)
{
	var _p = savpts.EmitterArea.prototype = this;
	
	var _areaList = [];
	var _gap = gap != null? gap: 10;
	var _left, _right, _top, _bottom;
	
	this.addRect = function(x, y, width, height, isUnion)
	{
		if(isUnion == null) isUnion = true;
		if(_areaList.length == 0)
		{ _left = x; _right = x+width; _top = y; _bottom = y+height; }
		else
		{
			if(_left > x) _left = x;
			if(_top > y) _top = y;
			if(_right < x+width) _right = x+width;
			if(_bottom < y+height) _bottom = y+height;
		}
		_areaList.push({type:"rect", shape:new savpts.Rectangle(x,y,width,height), isUnion:isUnion});
	};
	
	this.addCircle = function(x, y, radius, isUnion)
	{
		if(isUnion == null) isUnion = true;
		if(_areaList.length == 0)
		{ _left = x-radius; _right = x+radius; _top = y-radius; _bottom = y+radius; }
		else
		{
			if(_left > x-radius) _left = x-radius;
			if(_top > y-radius) _top = y-radius;
			if(_right < x+radius) _right = x+radius;
			if(_bottom < y+radius) _bottom = y+radius;
		}
		_areaList.push({type:"circle", shape:new savpts.Circle(x,y,radius), isUnion:isUnion});
	};
	
	this.getList = function()
	{
		if(_areaList.length == 0) return [];
		var list = [];
		
		var startX = _left + (((_right - _left)%_gap)*.5)<<0;
		var startY = _top + (((_bottom - _top)%_gap)*.5)<<0;
		var x, y, check, area, i, n=_areaList.length, shape;
		
		for(y=startY; y<= _bottom; y+=_gap)
		{
			for(x=startX; x<=_right; x+=_gap)
			{
				check = false;
				for(i=0;i<n;i++)
				{
					area = _areaList[i];
					shape = area.shape;
					if(area.type == "rect")
					{
						if(x >= shape.left && x <= shape.right && y >= shape.top && y <= shape.bottom)
						{
							if(area.isUnion) check = true;
							else { check = false; break; }
						}
					}
					else if(area.type == "circle")
					{
						var dx = x - shape.x;
						var dy = y - shape.y;
						if(Math.sqrt(dx*dx + dy*dy) <= shape.radius)
						{
							if(area.isUnion) check = true;
							else { check = false; break; }
						}
					}
				}
				if(check == true){ list.push(new savpts.Point(x, y)); /*console.log(list[list.length-1].toString());*/ }
			}
		}
		
		return list;
	};
};

savpts.Particle = function(className)
{
	var _p = savpts.Particle.prototype = this;
	
	var _classNameList = [];
	var _classNameIndex = 0;
	
	
	this.actionList = [];
	
	this.addAction = function(duration, position, deltaDuration)
	{
		var action = new savpts.ParticleAction(duration, position, deltaDuration);
		_p.actionList.push(action);
		return action;
	};
	
	this.changeClassName = function(className)
	{
		_classNameList = [];		
		if(typeof(className) === "string") _classNameList.push(className);
		else if(className instanceof Array) _classNameList = className;
		else console.error("illegal className type(must be String or Array)");
	};
	
	_p.changeClassName(className);
	
	this.createInstance = function()
	{
		var dom = document.createElement("div");
		dom.className = "savpts_particle " + _classNameList[_classNameIndex];
		_classNameIndex++;
		if(_classNameIndex >= _classNameList.length) _classNameIndex = 0;
		return dom;
	};
	
	this.clone = function(className)
	{
		var pt = new savpts.Particle(className);
		pt.actionList = _p.actionList.slice(0);
		return pt;
	};
	
	/*
	this.add = function(duration, position)
	{
		var node = new savpts.ParticleAction(duration, position);
		_p.actionList.push(node);
		return node;
	};
	*/
};

savpts.ParticleAction = function(duration, position, deltaDuration, usePercent)
{
	var _p = savpts.ParticleAction.prototype = this;
	
	var _params = this.params = {};
	
	
	//var _position = position != null? position: null;
	//var _duration = duration != null? duration: 0;
	
	this.position = position != null? position: null;
	this.duration = duration != null? duration: 0;
	this.deltaDuration = deltaDuration != null? deltaDuration: 0;
	//this.usePercent = deltaDuration != null? deltaDuration: 0;
	
	sp("ease");
	sp("x");
	sp("y");
	sp("alpha");
	sp("autoAlpha");
	sp("opacity");
	sp("scaleX");
	sp("scaleY");
	sp("scale");
	sp("left");
	sp("top");
	sp("marginLeft");
	sp("marginTop");
	sp("rotation");
	sp("width");
	sp("height");
	sp("bezier");
	sp("autoRotate");
	sp("ease", Linear.easeNone);
	
	this.getTweenParams = function()
	{
		var tweenParams = {};
		
		var key, minValue, delta;
		
		for(key in _params)
		{
			var param = _params[key];
			
			if(key == "bezier")
			{	
				var setting = param.value;
				var newSetting = {};
				for(var key2 in setting){ newSetting[key2] = setting[key2]; }
				
				
				var values = newSetting.values;
				if(values instanceof Array)
				{
					var newValues = [];
					for(var i=0;i<values.length;i++)
					{
						var newValue = {};
						var obj = values[i];
						if(obj.left != undefined){ newValue.left = (obj.left && obj.leftDelta)? obj.left + (obj.leftDelta*Math.random())<<0: obj.left; }
						if(obj.top != undefined){ newValue.top = (obj.top && obj.topDelta)? obj.top + (obj.topDelta*Math.random())<<0: obj.top; }
						if(obj.x != undefined){ newValue.x = (obj.x && obj.xDelta)? obj.x + (obj.xDelta*Math.random())<<0: obj.x; }
						if(obj.y != undefined){ newValue.y = (obj.y && obj.yDelta)? obj.y + (obj.yDelta*Math.random())<<0: obj.y; }
						newValues.push(newValue);
					}
				}
				
				newSetting.values = newValues;
				tweenParams[key] = newSetting;
			}
			else if(key == "scale")
			{
				var scale = param.delta != undefined? param.value + Math.random()*param.delta: param.value;
				if(param.userInterger) scale = tweenParams[key] << 0;
				if(param.relative) scale = "+=" + tweenParams[key];
				tweenParams["scaleX"] = tweenParams["scaleY"] = scale;
			}
			else
			{
				tweenParams[key] = param.delta != undefined? param.value + Math.random()*param.delta: param.value;
				if(param.userInterger) tweenParams[key] = tweenParams[key] << 0;
				if(param.relative) tweenParams[key] = "+=" + tweenParams[key];
				if(param.usePercent) tweenParams[key] += "%";
			}
		}
		
		return tweenParams;
	};
	
	function sp(key, defaultValue)
	{
		_p[key] = function(minValue, maxValue, relative, useInteger, usePercent)
		{
			if(minValue == null) return _params[key].value;
			
			if(_params[key] == undefined) _params[key] = {};
			var param = _params[key];
			
			if(minValue != null) param.value = minValue;
			if(maxValue != null) param.delta = maxValue - minValue;
			if(relative != null) param.relative = relative;
			if(useInteger != null) param.useInterger = useInteger;
			if(usePercent != null) param.usePercent = usePercent;
			
			return _p;
		};
		
		if(defaultValue != null) _p[key](defaultValue);
	}
};

/** misc func **/

function shuffleArray(o){
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o; }
	
}());