// JavaScript Document
(function ()
{
    "use strict";

    window.ImageScroll = ImageScroll;

    function ImageScroll(_bookId, _type, _title, _date)
    {
        var _p = ImageScroll.prototype = this;
        var _isInit = false;

        var _isLocking = false;

        var _dom;

        var Doms =
        {
        };

        var _tlStageIn;

        var _imageIdList = [];

        var _isActive = false;

        _p.stageIn = function (cb, option)
        {
            _isActive = true;
            loadAndBuild(stageIn_start);

            function stageIn_start()
            {
                _isLocking = true;
                //$("#main_frame").append(_dom);

                $(".menu").after(_dom);

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

            _isActive = false;

            var tl = new TimelineLite();
            tl.to(_dom,.5, {alpha: 0});


            TweenMax.to(MainFrame.Doms.footer,.5, {top:MainFrame.Doms.footer.init.t});

            TweenLite.delayedCall(tl.duration(), function ()
            {
                _isLocking = false;
                $(_dom).detach();

                MainFrame.showMainContainer();

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
                DataManager.execute("get_data", {table:"book_" + _bookId}, function(response)
                {
                    //console.log(JSON.stringify(response));

                    _imageIdList = response.images;

                    build();

                    MainFrame.hideMainContainer(function()
                    {
                        _isInit = true;
                        cb.apply();
                    });


                }, null, false, true);
            }

            function build()
            {
                _dom = document.createElement("div");
                $("#invisible_container").append(_dom);

                _dom.className = "image_scroll_container";

                Doms.title = document.createElement("div");
                Doms.title.className = "image_scroll_title";
                _dom.appendChild(Doms.title);

                Doms.date = document.createElement("div");
                Doms.date.className = "image_scroll_date";
                _dom.appendChild(Doms.date);

                Doms.title.innerHTML = _title;
                Doms.date.innerHTML = _date;

                //$(_dom).append($(frames[0].dom).children("div"));

                //Doms.content = Core.extract("#content");

                buildTimeline();
                bindFunc();

                loadImages();

                if (_dom.parentNode) _dom.parentNode.removeChild(_dom);
            }
        }

        function loadImages()
        {
            var index = 0;

            var totalHeight = 0;

            loadOne();

            function loadOne()
            {
                if(index >= _imageIdList.length)
                {
                    return;
                }

                var id = _imageIdList[index].id;
                index ++;

                var url = "admin/uploads/book_" + _bookId + "/image_" + id + ".jpg";

                var imageDom = document.createElement("img");
                imageDom.className = "image_scroll_block";
                imageDom.onload = function()
                {
                    //console.log("loaded");
                    _dom.appendChild(imageDom);

                    totalHeight += imageDom.height + 30;

                    TweenMax.set(imageDom, {alpha:0});

                    TweenMax.to(MainFrame.Doms.footer,.5, {top:280 + totalHeight});

                    TweenMax.to(imageDom,.7, {delay:.5, alpha:1, onComplete:function()
                    {
                        if(_isActive) loadOne();
                    }});

                    //console.log($(_dom).height());


                };

                imageDom.src = url;

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
