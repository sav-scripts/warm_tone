// JavaScript Document
(function ()
{
    "use strict";

    window.ImageCycle = ImageCycle;
    window.CollectionImages = new ImageCycle("collection", "/Collection");
    //window.CreativeImages = new ImageCycle("creative", "/Creative");



    function ImageCycle(_type, prevStageName)
    {
        var _p = ImageCycle.prototype = this;
        var _isInit = false;

        var _isLocking = false;

        var _dom;

        var Doms =
        {
        };

        var _tlStageIn;

        var _imageIdList;

        var _currentIndex = 0;
        var _autoPlay = true;
        var _tlAutoPlay;

        var _autoplayTimed = false;

        var _cycleDuration = 4;

        _p.stageIn = function (cb, option)
        {
            if (!_isInit) loadAndBuild(stageIn_start);
            else stageIn_start();

            function stageIn_start()
            {
                $(".main_container").append(_dom);

                TweenMax.to(_dom,.5, {alpha:1});

                _currentIndex = 0;

                if(_type == "collection")
                {
                    if(Collection.selectedIndex != null)
                    {
                        _currentIndex = Collection.selectedIndex;
                    }
                }
                else
                {
                    if(Creative.selectedIndex != null)
                    {
                        _currentIndex = Creative.selectedIndex;
                    }
                }

                playList();
                MainFrame.switchBtnBack(true, function()
                {
                    Core.toStage(prevStageName);
                });

                if (cb)cb.apply();
            }
        };

        _p.stageOut = function (cb)
        {
            _isLocking = true;

            MainFrame.cbAutoPlayChanged = null;
            MainFrame.switchAutoplay(false);
            MainFrame.switchBtnBack(false);

            _tlAutoPlay.pause();

            var tl = new TimelineLite();
            tl.to(_dom,.5, {alpha: 0});

            TweenLite.delayedCall(tl.duration(), function ()
            {
                _isLocking = false;
                if (_dom.parentNode)_dom.parentNode.removeChild(_dom);
                if (cb)cb.apply();
            });
        }

        /** private methods **/
        function loadAndBuild(cb)
        {
            DataManager.execute("get_data", {table:_type}, function(response)
            {
                _imageIdList = response.images;

                build();

                MainFrame.exitLoadingMode(1, function()
                {
                    _isInit = true;
                    cb.apply();
                });

            });
        
                    
            function build()
            {
                _dom = document.createElement("div");
                _dom.className = "image_show_container";
                _isInit = true;

                Doms.btnPrev = document.createElement("div");
                Doms.btnPrev.className = "arrow_prev";
                _dom.appendChild(Doms.btnPrev);

                Doms.btnNext = document.createElement("div");
                Doms.btnNext.className = "arrow_next";
                _dom.appendChild(Doms.btnNext);

                Doms.loadingIcon = document.createElement("div");
                Doms.loadingIcon.className = "image_show_loading";
                //$(Doms.loadingIcon).css("z-index", 10);
                _dom.appendChild(Doms.loadingIcon);

                _tlAutoPlay = new TimelineMax({paused:true});
                _tlAutoPlay.add(function()
                {
                    //toNext();
                    _autoplayTimed = true;
                    if(Doms.nextImage)
                    {
                        replaceToNextImage();
                    }
                }, _cycleDuration);

                switchLoadingIcon(true);

                bindFunc();
            }
        }

        function bindFunc()
        {
            $(Doms.btnPrev).click(function()
            {
                MainFrame.switchAutoplay(null, false);
                toPrev();
            });

            $(Doms.btnNext).click(function()
            {
                MainFrame.switchAutoplay(null, false);
                toNext();
            });
        }

        function playList()
        {
            if(_imageIdList.length > 1)
            {
                MainFrame.switchAutoplay(true, null);
                _autoPlay = MainFrame.getAutoPlay();
                MainFrame.cbAutoPlayChanged = autoPlayChanged;
            }
            else
            {
                MainFrame.cbAutoPlayChanged = null;
                MainFrame.switchAutoplay(false);
            }

            showImage();
        }

        function autoPlayChanged()
        {
            _autoPlay = MainFrame.getAutoPlay();
            if(_autoPlay)
            {
                //if(!_isLocking) _tlAutoPlay.restart();
                toNext();
            }
            else
            {
                _tlAutoPlay.pause();
                if(Doms.nextImage)
                {
                    Doms.nextImage.onload = null;
                    Doms.nextImage = null;
                }
            }
        }

        function switchLoadingIcon(turnOn)
        {
            if(turnOn)
            {
                TweenMax.to(Doms.loadingIcon,.4, {autoAlpha:1});
            }
            else
            {
                TweenMax.to(Doms.loadingIcon,.4, {autoAlpha:0});
            }
        }

        function toNext()
        {
            if(_isLocking) return;
            _currentIndex ++;
            if(_currentIndex >= _imageIdList.length) _currentIndex = 0;
            showImage(false);
        }

        function toPrev()
        {
            if(_isLocking) return;
            _currentIndex --;
            if(_currentIndex < 0) _currentIndex = _imageIdList.length-1;
            showImage(true);
        }

        function showImage(toLeft)
        {
            removeOldImage(toLeft);

            var url = "admin/uploads/" + _type + "/image_" + _imageIdList[_currentIndex].id + ".jpg";

            _isLocking = true;

            Doms.image = document.createElement("img");
            //_dom.appendChild(Doms.image);
            switchLoadingIcon(true);

            Doms.image.onload = function()
            {
                _isLocking = false;
                playLoadedImage(toLeft);
            };

            Doms.image.src = url;
        }

        function playLoadedImage(toLeft)
        {
            switchLoadingIcon(false);
            _dom.appendChild(Doms.image);
            $(Doms.image).css("position", "absolute").css("left", "50%").css("top", "50%").css("margin-left", -Doms.image.width *.5).css("margin-top", -Doms.image.height *.5);
            TweenMax.from(Doms.image,.5, {alpha:0, left:toLeft?"40%":"60%"});

            if(_autoPlay)
            {
                _autoplayTimed = false;
                _tlAutoPlay.restart();
                prepareNext();
            }
        }

        function prepareNext()
        {
            var nextIndex = _currentIndex + 1;
            if(nextIndex >= _imageIdList.length) nextIndex = 0;
            var url = "admin/uploads/" + _type + "/image_" + _imageIdList[nextIndex].id + ".jpg";
            Doms.nextImage = document.createElement("img");
            Doms.nextImage.index = nextIndex;

            Doms.nextImage.onload = function()
            {
                if(_autoplayTimed && _autoPlay)
                {
                    replaceToNextImage(false);
                }
            };

            Doms.nextImage.src = url;
        }

        function replaceToNextImage()
        {
            removeOldImage(false);

            _currentIndex = Doms.nextImage.index;
            Doms.image = Doms.nextImage;
            Doms.nextImage = null;
            playLoadedImage(false);
        }

        function removeOldImage(toLeft)
        {
            if(Doms.image)
            {
                var dom = Doms.image;
                Doms.image = null;
                dom.onload = null;

                TweenMax.to(dom,.5, {alpha:0, left:toLeft?"60%":"40%", onComplete:function()
                {
                    $(dom).detach();
                }});

            }
        }
    }

}());
