// JavaScript Document
(function ()
{
    "use strict";

    window.Contact = new Contact();

    function Contact()
    {
        var _p = Contact.prototype = this;
        var _isInit = false;

        var _isLocking = false;

        var _dom;

        var Doms =
        {
        };

        var _tlStageIn;

        _p.stageIn = function (cb, option)
        {
            console.info("Contact stage in, option = " + JSON.stringify(option));
            if (!_isInit) loadAndBuild(stageIn_start);
            else stageIn_start();

            function stageIn_start()
            {
                MainFrame.firstPlayBgm();
                MainFrame.exitLoadingMode(0);
                _isLocking = true;
                $(".main_container").append(_dom);
                _p.windowResize();

                _tlStageIn.restart();

                TweenLite.delayedCall(_tlStageIn.duration(), function ()
                {
                    _isLocking = false;
                    if (cb)cb.apply();
                });
            }
        };

        _p.stageOut = function (cb)
        {
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
                        {url: "_contact.html", startWeight: 30, weight: 70, dom: null}
                    ];

                Core.load(null, frames, function loadComplete()
                {
                    build();

                    MainFrame.exitLoadingMode(1, function()
                    {
                        _isInit = true;
                        cb.apply();
                    });
                }, null);


                function build()
                {
                    _dom = document.createElement("div");
                    $("#invisible_container").append(_dom);

                    $(_dom).append($($(frames[0].dom).find(".main_container")[0]).children("div"));

                    //Doms.content = Core.extract("#content");

                    buildTimeline();
                    bindFunc();

                    if (_dom.parentNode) _dom.parentNode.removeChild(_dom);
                }
            }
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
