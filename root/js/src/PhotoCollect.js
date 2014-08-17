// JavaScript Document
(function ()
{
    "use strict";

    window.Collection = new PhotoCollect("collection", 190, 190, 990, 590, 5, 3, "/CollectionImages", "");
    //window.Creative = new PhotoCollect("creative", 300, 200, 1230, 620, 4, 3, "/CreativeImages", "book_thumb_container");

    function PhotoCollect(_type, _thumbWidth, _thumbHeight, _wallWidth, _wallHeight, _numCols, _numRows, _cycleName, _containerName, _withText)
    {
        var _p = PhotoCollect.prototype = this;
        var _isInit = false;

        var _isLocking = false;

        var _dom;

        var Doms =
        {
        };

        var _imageIdList = [];

        var _tlStageIn;

        var PAGE_SIZE = _numCols * _numRows;
        var _numPages;
        var _currentPage = -1;

        var _inImageShow = false;

        var _thumbList = [];

        _p.stageIn = function (cb, option)
        {
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

            if(_inImageShow)
            {
                _inImageShow = false;

                ImageShow.hide(function()
                {
                    _isLocking = false;
                    $(_dom).detach();
                    if (cb)cb.apply();
                });
            }
            else
            {
                var tl = new TimelineLite();
                tl.to(_dom,.5, {alpha: 0});

                TweenLite.delayedCall(tl.duration(), function ()
                {
                    _isLocking = false;
                    $(_dom).detach();
                    if (cb)cb.apply();
                });
            }
        };

        _p.windowResize = windowResize;

        /** private methods **/
        function loadAndBuild(cb)
        {


            var frames =
                [
                    {url: "_collection.html", startWeight: 30, weight: 70, dom: null}
                ];

            MainFrame.toLoadingMode(null, execute);


            function execute()
            {
                Core.load(null, frames, function()
                {

                    DataManager.execute("get_data", {table:_type}, function(response)
                    {
                        _imageIdList = response.images;
//                        _imageIdList = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];

                        _numPages = Math.ceil(_imageIdList.length / PAGE_SIZE);

                        build();

                        MainFrame.exitLoadingMode(1, function()
                        {
                            _isInit = true;
                            cb.apply();
                        });


                    }, null, false, true);

                });
            }

            function build()
            {
                _dom = document.createElement("div");
                $("#invisible_container").append(_dom);
                $(_dom).append($($(frames[0].dom).find(".main_container")[0]).children("div"));

                if(_containerName) _dom.className = _containerName;

                Doms.thumbWall = Core.extract(".collection_thumb_wall");
                Doms.btnPrev = Core.extract(".arrow_prev");
                Doms.btnNext = Core.extract(".arrow_next");

                $(Doms.thumbWall).css("width", _wallWidth).css("height", _wallHeight).css("margin-left", -_wallWidth *.5).css("margin-top", -_wallHeight *.5);

                toPage(0);

                buildTimeline();
                bindFunc();

                if (_dom.parentNode) _dom.parentNode.removeChild(_dom);
            }
        }

        function toPage(pageIndex, toLeft)
        {
            if(_currentPage == pageIndex) return;

            _isLocking = true;

            var isFirstRun = (_thumbList.length == 0);

            _currentPage = pageIndex;

            TweenMax.to(Doms.btnPrev,.3, {alpha:0});
            TweenMax.to(Doms.btnNext,.3, {alpha:0});

            var oldThumbList = _thumbList.concat([]);
            createThumbs(!isFirstRun);


            if(!isFirstRun)
            {
                var offsetX = toLeft? 1000: -1000;
                var tl = new TimelineMax();
                var i, thumb;
                for(i=0;i<oldThumbList.length;i++)
                {
                    thumb = oldThumbList[i];
                    tl.to(thumb,1, {left:thumb.targetX+offsetX, ease:Power1.easeInOut, alpha:0}, 0);
                }


                for(i=0;i<_thumbList.length;i++)
                {
                    thumb = _thumbList[i];
                    tl.from(thumb,1, {left:thumb.targetX-offsetX, ease:Power1.easeInOut, alpha:0}, 0);
                }


                tl.add(function()
                {
                    for(var i=0;i<oldThumbList.length;i++)
                    {
                        var thumb = oldThumbList[i];
                        $(thumb).detach();
                    }

                    _isLocking = false;
                    showArrows();
                });
            }
            else
            {
                _isLocking = false;
                showArrows();
            }
        }

        function showArrows()
        {

            (_currentPage <= 0)? $(Doms.btnPrev).css("display", "none"): $(Doms.btnPrev).css("display", "block");
            (_currentPage >= (_numPages-1))? $(Doms.btnNext).css("display", "none"): $(Doms.btnNext).css("display", "block");


            TweenMax.to(Doms.btnPrev,.3, {alpha:1});
            TweenMax.to(Doms.btnNext,.3, {alpha:1});
        }

        function createThumbs(hideIt)
        {
            _thumbList = [];
            var startIndex = _currentPage * PAGE_SIZE;
            var endIndex = startIndex + PAGE_SIZE;
            if(endIndex > _imageIdList.length) endIndex = _imageIdList.length;

            var row = 0;
            var col = 0;

            for(var i=startIndex;i<endIndex;i++)
            {
                var obj = _imageIdList[i];
                var thumb = new ThumbBlock(_type, i, obj, col, row, _thumbWidth, _thumbHeight, _withText);

                //if(hideIt) TweenMax.set(thumb, {alpha:0});
                Doms.thumbWall.appendChild(thumb);
                _thumbList.push(thumb);

                $(thumb).click(function()
                {
                    if(_isLocking) return;

                    toImageMode(this.getIndex());
                });

                col ++;
                if(col >= 5)
                {
                    col=0; row++;
                }
            }
        }

        function toImageMode(index)
        {
            _isLocking = true;

            _p.selectedIndex = index;

            Core.toStage(_cycleName);
        }

        function showThumbs(cb)
        {
            var tl = new TimelineMax();

            var position = 0;

            for(var i=0;i<_thumbList.length;i++)
            {
                var thumb = _thumbList[i];
                tl.to(thumb,.5, {alpha:1},position);
                position += .05;
            }

            if(cb) tl.add(cb);
        }

        function buildTimeline()
        {
            var tl = _tlStageIn = new TimelineMax();
            tl.set(_dom, {alpha: 0}, 0);
            tl.to(_dom, .5, {alpha: 1}, 0);

            tl.add(function()
            {
                showThumbs();
            }, 0);

            tl.stop();
        }

        function bindFunc()
        {
            $(Doms.btnPrev).click(function()
            {
                if(_isLocking) return;

                var targetPage = _currentPage-1;
                if(targetPage < 0) targetPage = _numPages-1;
                toPage(targetPage, true);

            });

            $(Doms.btnNext).click(function()
            {
                if(_isLocking) return;

                var targetPage = _currentPage+1;
                if(targetPage >= _numPages) targetPage = 0;
                toPage(targetPage, false);

            });
        }

        /** resize and deform **/
        function windowResize()
        {
        }
    }

    function ThumbBlock(_type, _index, _data, _col, _row, _thumbWidth, _thumbHeight, _withText)
    {
        var _id = _data.id;
        var _dom = document.createElement("div");
        _dom.className = "collection_thumb_block";

        $(_dom).css("width", _thumbWidth).css("height", _thumbHeight);

        _dom.getId = function(){ return _id; };
        _dom.getIndex = function(){ return _index; };

        _dom.targetX = _col * (_thumbWidth+10);
        _dom.targetY = _row * (_thumbHeight+10);

        $(_dom).css("left", _dom.targetX).css("top", _dom.targetY);

        var imageDom = document.createElement("img");
        imageDom.src = "admin/uploads/"+_type+"/thumb_" + _id + ".jpg";

        _dom.appendChild(imageDom);

        if(_withText)
        {
            if(!_data.title) _data.title = "";
            if(!_data.description) _data.description = "";

            var cover = document.createElement("div");
            cover.className = "book_thumb_cover";
            _dom.appendChild(cover);

            var title = document.createElement("div");
            title.className = "book_thumb_title";
            _dom.appendChild(title);

            var description = document.createElement("div");
            description.className = "book_thumb_description";
            _dom.appendChild(description);

            title.innerHTML = _data.title;
            //description.innerHTML = _data.description;

            var text = _data.description.replace(/\r\n|\r|\n/g,"<br />");

            $(description).html(text);

            TweenMax.set(cover, {autoAlpha:0});
            TweenMax.set(title, {autoAlpha:0});
            TweenMax.set(description, {autoAlpha:0});

            $(_dom).mouseover(function(event)
            {
                if($(_dom).has(event.relatedTarget).length) return;
                if(_dom == event.relatedTarget) return;

                TweenMax.to(cover,.5, {autoAlpha:1});
                TweenMax.to(title,.5, {autoAlpha:1});
                TweenMax.to(description,.5, {autoAlpha:1});
            });

            $(_dom).mouseout(function(event)
            {
                if($(_dom).has(event.relatedTarget).length) return;
                if(_dom == event.relatedTarget) return;

                TweenMax.killTweensOf(title);
                TweenMax.killTweensOf(description);

                TweenMax.to(cover,.5, {autoAlpha:0});
                TweenMax.to(title,.5, {autoAlpha:0});
                TweenMax.to(description,.5, {autoAlpha:0});

            });

        }

        return _dom;
    }

}());
