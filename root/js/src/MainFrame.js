// JavaScript Document
(function () {
    "use strict";

    window.MainFrame = new MainFrame();

    function MainFrame() {
        var _p = MainFrame.prototype = this;
        var _isInit = false;

        var _isLocking = false;

        var _dom;

        var _isInLoadingMode = false;

        var Doms = _p.Doms =
        {
        };

        var _tlStageIn;

        var _autoPlayOn = true;
        var _cbAutoPlayClick;

        _p.cbAutoPlayChanged = null;

        _p.stageIn = function (cb, option) {
            if (!_isInit) loadAndBuild(stageIn_start);
            else stageIn_start();

            function stageIn_start() {
                _isLocking = true;
                $("body").append(_dom);
                _p.windowResize();

                _tlStageIn.restart();

                TweenLite.delayedCall(_tlStageIn.duration(), function () {
                    _isLocking = false;
                    if (cb)cb.apply();
                });
            }
        };

        _p.stageOut = function (cb) {
            _isLocking = true;

            var tl = new TimelineLite();
            tl.to(_dom, 1, {alpha: 0});

            TweenLite.delayedCall(tl.duration(), function () {
                _isLocking = false;
                $(_dom).detach();
                if (cb)cb.apply();
            });
        };

        _p.toLoadingMode = toLoadingMode;
        _p.exitLoadingMode = exitLoadingMode;
        _p.switchAutoplay = switchAutoplay;
        _p.getAutoPlay = getAutoPlay;
        _p.showMainContainer = showMainContainer;
        _p.hideMainContainer = hideMainContainer;
        _p.switchBtnBack = switchBtnBack;

        _p.windowResize = windowResize;

        /** private methods **/
        function loadAndBuild(cb) {
            var frames =
                [
                    {url: "_main_frame.html", startWeight: 30, weight: 70, dom: null}
                ];

            var imageLoading =
            {
                startWeight: 30,
                weight: 0,
                list: [
                ]
            };

            Core.load(imageLoading, frames, function loadComplete() {
                build();
                _isInit = true;
                cb.apply();
            }, null);

            function build() {
                //_dom = document.createElement("div");
                _dom = $(frames[0].dom).find("#main_frame")[0];
                $("#invisible_container").append(_dom);

                //$(_dom).append($(frames[0].dom).children("div"));

                //Doms.content = Core.extract("#content");

                Doms.title = Core.extract(".title");

                Doms.footer = Core.extract(".footer");

                Doms.btnHome = Core.extract(".home");
                Doms.btnProfile = Core.extract(".profile");
                Doms.btnCollection = Core.extract(".collection");
                Doms.btnPortfolio = Core.extract(".portfolio");
                Doms.btnContact = Core.extract(".contact");


                Doms.container = Core.extract(".main_container");
                Doms.loadingIcon = Core.extract(".loading_icon");

                Doms.btnAutoplay = Core.extract(".btn_autoplay");

                Doms.btnBack = Core.extract(".btn_back");

                $(Doms.loadingIcon).css("display", "none");

                switchAutoplay(false, true);
                switchBtnBack(false);

                setupSound();

                toLoadingMode(0);

                setupOptions(Doms.btnPortfolio);

                buildTimeline();
                bindFunc();

                if (_dom.parentNode) _dom.parentNode.removeChild(_dom);
            }

            function setupSound()
            {
                var btnSound = Core.extract(".btn_sound");

                var firstPlayed = false;

                _p.firstPlayBgm = function()
                {
                    if(firstPlayed) return;
                    firstPlayed = true;

                    SoundPlayer.playBGM();
                    $(btnSound).toggleClass("sound_on", true);
                };

                /*
                $(btnSound).mouseover(function()
                {
                    $(btnSound).toggleClass("sound_on", !SoundPlayer.getBgmOn());
                });

                $(btnSound).mouseout(function()
                {
                    $(btnSound).toggleClass("sound_on", SoundPlayer.getBgmOn());
                });
                */

                $(btnSound).click(function()
                {
                    SoundPlayer.switchBGM();
                    $(btnSound).toggleClass("sound_on", SoundPlayer.getBgmOn());
                });

            }

            function setupOptions(dom)
            {
                var containerDom = Core.extract(".options", dom);
                dom.options = $(containerDom).children(".option");
                var btnCount = dom.options.length;
                var totalHeight = 32 * btnCount + 16;

                $(containerDom).css("overflow", "hidden").css("height", 0);

                Doms.btnWedding = Core.extract(".option_0");
                Doms.btnPhotograph = Core.extract(".option_1");
                Doms.btnCreative = Core.extract(".option_2");

                $(Doms.btnWedding).click(function()
                {
                    $(dom).trigger("mouseout");
                    Core.toStage("/Wedding");
                });

                $(Doms.btnPhotograph).click(function()
                {
                    $(dom).trigger("mouseout");
                    Core.toStage("/Photograph");

                });
                $(Doms.btnCreative).click(function()
                {
                    $(dom).trigger("mouseout");
                    Core.toStage("/Creative");

                });

                $(dom).mouseover(function(event)
                {
                    if($(dom).has(event.relatedTarget).length) return;
                    if(dom == event.relatedTarget) return;
                    TweenMax.to(containerDom,.5, {height:totalHeight});
                });

                $(dom).mouseout(function(event)
                {
                    if($(dom).has(event.relatedTarget).length) return;
                    if(dom == event.relatedTarget) return;
                    TweenMax.to(containerDom,.5, {height:0});
                });
            }
        }

        function buildTimeline() {
            var tl = _tlStageIn = new TimelineMax();
            tl.set(_dom, {alpha: 0}, 0);
            tl.to(_dom, .3, {alpha: 1}, 0);

            var dom, v;

            dom = Doms.title; v = dom.init;
            tl.set(dom, {alpha:0},.0);
            tl.to(dom,.5, {alpha:1},.3);

            dom = Doms.btnCollection; v = dom.init;
            tl.set(dom, {alpha:0},.0);
            tl.to(dom,.5, {alpha:1},.4);

            dom = Doms.btnProfile; v = dom.init;
            tl.set(dom, {alpha:0},.0);
            tl.to(dom,.5, {alpha:1},.5);

            dom = Doms.btnPortfolio; v = dom.init;
            tl.set(dom, {alpha:0},.0);
            tl.to(dom,.5, {alpha:1},.5);

            dom = Doms.btnContact; v = dom.init;
            tl.set(dom, {alpha:0},.0);
            tl.to(dom,.5, {alpha:1},.6);

            dom = Doms.btnHome; v = dom.init;
            tl.set(dom, {alpha:0},.0);
            tl.to(dom,.5, {alpha:1},.6);

            dom = Doms.footer; v = dom.init;
            tl.set(dom, {alpha:0, marginTop: v.mt+50},.0);
            tl.to(dom,.5, {alpha:1, marginTop: v.mt},.4);

            dom = Doms.container; v = dom.init;
            tl.set(dom, {alpha:0},.0);
            tl.to(dom,.5, {alpha:1},.8);


            tl.stop();
        }

        function bindFunc()
        {
            $(Doms.btnHome).click(function()
            {
               Core.toStage("/Home");
            });

            $(Doms.btnCollection).click(function()
            {
                Core.toStage("/Collection");
            });

            $(Doms.btnProfile).click(function()
            {
                Core.toStage("/Profile");
            });

            $(Doms.btnContact).click(function()
            {
                Core.toStage("/Contact");
            });

            $(Doms.btnAutoplay).click(function()
            {
                switchAutoplay(null, !_autoPlayOn);
            });
        }

        function toLoadingMode(duration, cb)
        {
            showMainContainer();
            if(_isInLoadingMode)
            {
                if(cb != null) cb.apply();
                return;
            }

            _isInLoadingMode = true;

            if(duration == null) duration = .5;
            TweenMax.to(Doms.container,duration, {width:40, height:40, borderRadius:10, marginLeft:-20, top:Doms.container.init.t + Doms.container.init.h *.5 - 70, onComplete:function()
            {
                $(Doms.loadingIcon).css("display", "block");
                if(cb != null) cb.apply();
            }});
        }


        function showMainContainer(cb)
        {
            $(Doms.container).css("display", "block");
            TweenMax.to(Doms.container,.5, {alpha:1, onComplete:function()
            {
                if(cb) cb.apply();
            }});
        }

        function hideMainContainer(cb)
        {
            TweenMax.to(Doms.container,.5, {alpha:0, onComplete:function()
            {
                $(Doms.container).css("display", "none");
                if(cb) cb.apply();
            }});
        }

        function exitLoadingMode(duration, cb)
        {
            showMainContainer();
            if(_isInLoadingMode == false)
            {
                if(cb != null) cb.apply();
                return;
            }

            _isInLoadingMode = false;

            if(duration == null) duration = .5;
            var dom = Doms.container, v = dom.init;
            TweenMax.to(Doms.container,duration, {delay:0, ease:Power1.easeInOut, width: v.w, height: v.h, borderRadius:0, marginLeft: v.ml, top: v.t, onStart:function()
            {
                $(Doms.loadingIcon).css("display", "none");
            }, onComplete:function()
            {
                if(cb != null) cb.apply();
            }});
        }

        function getAutoPlay()
        {
            return _autoPlayOn;
        }

        function switchAutoplay(showIt, turnOn)
        {
            if(showIt != null)
            {
                showIt? $(Doms.btnAutoplay).css("display", "block"): $(Doms.btnAutoplay).css("display", "none");
            }

            if(turnOn != null)
            {
                _autoPlayOn = turnOn;
                if(_autoPlayOn)
                {
                    Doms.btnAutoplay.innerHTML = "Auto Play: <span style='color:#FF9900'>&nbsp;ON</span>";
                }
                else
                {
                    Doms.btnAutoplay.innerHTML = "Auto Play: OFF";
                }
            }

            if(_p.cbAutoPlayChanged) _p.cbAutoPlayChanged.apply();
        }

        function switchBtnBack(showIt, cb)
        {
            if(showIt != null)
            {
                showIt? $(Doms.btnBack).css("display", "block"): $(Doms.btnBack).css("display", "none");
            }

            $(Doms.btnBack).unbind("click");

            if(cb)
            {
                $(Doms.btnBack).bind("click", cb);
            }
        }

        /** resize and deform **/
        function windowResize() {
        }
    }

}());
