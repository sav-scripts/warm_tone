// JavaScript Document
(function(){
	
window.SoundPlayer = 
{
	initSound:initSound
};
	
function initSound(_withFlashPlugin, cbLoaded)
{
    var _bgmOn = false;
	var _queueBGM = false;
	var _bgm;
	var audioPath = "misc/";
	var manifest = [
		{id:"bgm", src:"bgm.mp3", volume:1}
	];
	
	if(_withFlashPlugin)
	{
		createjs.FlashPlugin.swfPath = "misc/";
		createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
	}
	
	if (!createjs.Sound.initializeDefaultPlugins()) 
	{
		console.log("can't init soundjs");
		return;
	}
	
	createjs.Sound.alternateExtensions = ["mp3"];
	createjs.Sound.addEventListener("fileload", handleLoad);
	createjs.Sound.registerManifest(manifest, audioPath);
 
	function handleLoad(event) {
		createjs.Sound.removeEventListener("fileload", handleLoad);
		
		_bgm = createjs.Sound.play("bgm", "none", 0, 0, -1);
		_withFlashPlugin? _bgm.stop(): _bgm.pause();
	
		if(_queueBGM)
		{
			_queueBGM = false;
			playBGM();
		}

        if(cbLoaded) cbLoaded.apply();
	}
	
	SoundPlayer.getBgmOn = function(){ return _bgmOn; };

    SoundPlayer.playBGM = playBGM;
    SoundPlayer.stopBGM = stopBGM;

    SoundPlayer.switchBGM = function()
	{
		_bgmOn = !_bgmOn;
		
		if(_bgmOn)
		{
			playBGM();
		}
		else
		{
			stopBGM();
		}
	};
	
	
	function playBGM()
	{
        _bgmOn = true;
		if(_bgm)
		{			
			if(_withFlashPlugin)
			{
				if(_bgm.playState == 'playFinished') _bgm.play({loop:-1});
			}
			else _bgm.resume();
			
			_bgm.volume = .0;
			TweenLite.killTweensOf(_bgm);
			TweenLite.to(_bgm, 1, {volume:manifest[0].volume, onUpdate:function()
			{
				if(_withFlashPlugin) _bgm.setVolume(_bgm.volume);
			}});
			
			
		}
		else
		{
			_queueBGM = true;
		}
	}
	
	function stopBGM()
	{
        _bgmOn = false;
		_queueBGM = false;
		if(_bgm)
		{
			TweenLite.killTweensOf(_bgm);
			TweenLite.to(_bgm, 1, {volume:.0, onUpdate:function()
			{
				if(_withFlashPlugin) _bgm.setVolume(_bgm.volume);
			}, onComplete:function()
			{
				_withFlashPlugin? _bgm.stop(): _bgm.pause();			
			}});
		}
	}
}
	
}());