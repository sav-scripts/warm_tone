// JavaScript Document
(function ()
{
    "use strict";

    window.Wedding = new BookList("wedding");
    window.Photograph = new BookList("photograph");
    window.Creative = new BookList("creative", true);

    function BookList(_type, _isCycleMode)
    {
        var _p = BookList.prototype = this;
        var _isInit = false;

        var _isLocking = false;

        var _dom;

        var Doms =
        {
        };

        var _bookList = [];

        var _tlStageIn;

        var PAGE_SIZE = 12;
        var _numPages;
        var _currentPage = -1;

        var _thumbList = [];

        _p.stageIn = function (cb, option)
        {
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

            var frames =
                [
                    {url: "_book.html", startWeight: 30, weight: 70, dom: null}
                ];


            MainFrame.toLoadingMode(null, execute);


            function execute()
            {
                Core.load(null, frames, function()
                {

                    DataManager.execute("get_book_list", {type:_type, ignore_empty:"1"}, function(response)
                    {
                        //_imageIdList = response.images;
//                        _imageIdList = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
                        _bookList = response.book_list;

                        _numPages = Math.ceil(_bookList.length / PAGE_SIZE);

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
                _dom.className = "book_thumb_container";
                $("#invisible_container").append(_dom);

                $(_dom).append($($(frames[0].dom).find(".main_container")[0]).children("div"));

                Doms.thumbWall = Core.extract(".book_thumb_wall");
                Doms.btnPrev = Core.extract(".arrow_prev");
                Doms.btnNext = Core.extract(".arrow_next");

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
            if(endIndex > _bookList.length) endIndex = _bookList.length;

            var row = 0;
            var col = 0;

            for(var i=startIndex;i<endIndex;i++)
            {
                var data = _bookList[i];
                var thumb = new BookThumbBlock(i, data, col, row);

                //if(hideIt) TweenMax.set(thumb, {alpha:0});
                Doms.thumbWall.appendChild(thumb);
                _thumbList.push(thumb);

                $(thumb).click(function()
                {
                    if(_isLocking) return;

                    $(this).trigger("mouseout");

                    toImageMode(this.getId());
                });

                col ++;
                if(col >= 4)
                {
                    col=0; row++;
                }
            }
        }

        function toImageMode(id)
        {
            //Core.toStage("/book_" + id);

            if(_isCycleMode)
            {
                Core.toStage("/slide_" + id);
            }
            else
            {
                Core.toStage("/book_" + id);
            }
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

    function BookThumbBlock(_index, _data, _col, _row)
    {
        //console.log(JSON.stringify(_data));

        var _id = _data.id;

        var _dom = document.createElement("div");
        _dom.className = "book_thumb_block";

        _dom.getId = function(){ return _id; };
        _dom.getIndex = function(){ return _index; };

        _dom.targetX = _col * 310;
        _dom.targetY = _row * 210;

        $(_dom).css("left", _dom.targetX).css("top", _dom.targetY);

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

        if(_data.cover_id != null)
        {
            var imageDom = document.createElement("img");
            imageDom.src = "admin/uploads/book_"+_id+"/thumb_" + _data.cover_id + ".jpg";
            _dom.appendChild(imageDom);
        }


        return _dom;
    }

}());
