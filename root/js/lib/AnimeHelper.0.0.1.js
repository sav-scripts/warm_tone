// JavaScript Document

(function(){
"use strict"

window.SpriteSheetAnime = SpriteSheetAnime;

function SpriteSheetAnime(pictureSrc, frameWidth, frameHeight, numCols, numRows, numFrames, frameRate)
{	
	var _dom = document.createElement("div");
	
	_dom.start = function()
	{
		if(_playing) return;
		_playing = true;
		//update();
		_tl.resume();
	};
	
	_dom.stop = function()
	{
		if(!_playing) return;
		_playing = false;
		_tl.stop();
	};
	
	_dom.restart = function()
	{
		_dom.toFrameZero();
		_dom.start();
	};
	
	_dom.toFrameZero = function()
	{
		frameCount = 0;
		col = 0;
		row = 0;
		
		changeBackgroundPosition();
	};
	
	_dom.destroy = destroyAnime;
	
	var _isDestroy = false;
	var _playing = false;
	var delay = (1000/frameRate)<<0;
	
	var col = 0,
		row = 0;
	
	var frameCount = 0;
	
	$(_dom).css("position", "absolute").
		css("width", frameWidth).
		css("height", frameHeight).
		css("background-image", "url(" + pictureSrc + ")").
		//css("margin-left", "-"+(frameWidth*.5)+"px").css("margin-top", "-"+(frameHeight*.5)+"px").
		css("background-position", "0px 0px");
	
	//update();
	
	var _tl = new TimelineLite().stop();
	_tl.add(function ()
	{
		changeBackgroundPosition();
		
		col ++;
		if(col >= numCols)
		{
			col = 0;
			row ++;
		}
		
		frameCount ++;
		if(frameCount >= numFrames)
		{
			frameCount = 0;
			col = 0;
			row = 0;
		}
		
		_tl.restart();
		
		//if(!_isDestroy && _playing) setTimeout(update, delay);
	}, delay / 1000);
	
	function changeBackgroundPosition()
	{
		var tx = -col*frameWidth;
		var ty = -row*frameHeight;
		
		var tv = tx+"px " + ty + "px";
		//console.log(tv);
		
		$(_dom).css("background-position", tv);
	}
	
	function destroyAnime()
	{
		_isDestroy = true;
		if(_dom.parentNode) _dom.parentNode.removeChild(_dom);
	};
	
	return _dom;
};

}());