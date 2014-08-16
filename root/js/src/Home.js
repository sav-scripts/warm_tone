// JavaScript Document
(function ()
{
    "use strict";

    window.Home = new Home();

    function Home()
    {
        var _p = Home.prototype = this;
        var _isInit = false;

        var _isActive = false;

        var _isLocking = false;

        var _dom;

        var Doms =
        {
        };

        var _imageIdList = [];
        var _currentIndex = 0;

        var _tlStageIn;

        var _cycleTL;

        _p.stageIn = function (cb, option)
        {
            console.info("Home stage in, option = " + JSON.stringify(option));
            if (!_isInit) loadAndBuild(stageIn_start);
            else stageIn_start();

            function stageIn_start()
            {
                MainFrame.exitLoadingMode(0);
                _isLocking = true;
                $(".main_container").append(_dom);
                _p.windowResize();

                _tlStageIn.restart();

                TweenLite.delayedCall(_tlStageIn.duration(), function ()
                {
                    _isActive = true;
                    _cycleTL.restart();

                    _isLocking = false;
                    if (cb)cb.apply();
                });
            }
        };

        _p.stageOut = function (cb)
        {
            _isActive = false;
            _cycleTL.pause();
            _isLocking = true;

            var tl = new TimelineLite();
            tl.to(_dom,.5, {alpha: 0});

            TweenLite.delayedCall(tl.duration(), function ()
            {
                _isLocking = false;
                $(_dom).detach();
                if (cb)cb.apply();
            });
        };

        _p.windowResize = windowResize;

        /** private methods **/
        function loadAndBuild(cb)
        {
            MainFrame.toLoadingMode(null, execute);

            function execute()
            {
                var frames =
                    [
                        {url: "_home.html", startWeight: 30, weight: 70, dom: null}
                    ];

                Core.load(null, frames, function loadComplete()
                {
                    DataManager.execute("get_data", {table:"home"}, function(response)
                    {
                        _imageIdList = response.images;

                        var url = "admin/uploads/home/image_" + _imageIdList[0].id + ".jpg";

                        loadImage(url, function(imageDom)
                        {
                            build(imageDom);

                            MainFrame.exitLoadingMode(1, function()
                            {
                                _isInit = true;
                                cb.apply();
                            });

                        });


                    }, null, false, true);

                }, null);


                function build(imageDom)
                {
                    _dom = document.createElement("div");
                    $("#invisible_container").append(_dom);

                    $(_dom).append($($(frames[0].dom).find(".main_container")[0]).children("div"));

                    //Doms.content = Core.extract("#content");

                    Doms.image = Core.extract(".home_image");

                    $(Doms.image).css("background", "url("+"admin/uploads/home/image_" + _imageIdList[0].id + ".jpg"+")");
                    updateImage(imageDom);


                    _currentIndex = 0;

                    _cycleTL = new TimelineMax({paused:true});
                    _cycleTL.add(function()
                    {
                        _currentIndex ++;
                        if(_currentIndex >= _imageIdList.length) _currentIndex = 0;

                        var url = "admin/uploads/home/image_" + _imageIdList[_currentIndex].id + ".jpg";

                        loadImage(url, function(imageDom)
                        {
                            var tl = new TimelineMax();
                            tl.to(Doms.image,1, {alpha:0, ease:Power1.easeIn});
                            tl.add(function()
                            {
                               $(Doms.image).css("background", "url("+url+")");
                                updateImage(imageDom);
                            });
                            tl.to(Doms.image,1, {alpha:1});
                            tl.add(function()
                            {
                               if(_isActive) _cycleTL.restart();
                            });
                        });


                    }, 3);

                    buildTimeline();
                    bindFunc();

                    if (_dom.parentNode) _dom.parentNode.removeChild(_dom);
                }

                function updateImage(imageDom)
                {
                    $(Doms.image).css("width", imageDom.width).css("height", imageDom.height).css("margin-left", -imageDom.width *.5).css("margin-top", -imageDom.height *.5);
                }
            }
        }

        function loadImage(url, cb)
        {
            var dom = document.createElement("img");
            dom.onload = function()
            {
                if(cb != null) cb.apply(null, [dom]);
            };

            dom.src = url;
        }

        function buildTimeline()
        {
            var tl = _tlStageIn = new TimelineMax();
            tl.set(_dom, {alpha: 0}, 0);
            tl.to(_dom, .5, {alpha: 1}, 0);

            tl.stop();
        }

        function bindFunc()
        {
        }

        /** resize and deform **/
        function windowResize()
        {
        }
    }

}());
