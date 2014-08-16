// JavaScript Document
(function ()
{
    "use strict";

    window.Wedding = new BookWall("wedding", 850);
    window.Photograph = new BookWall("photograph", 850);
    window.Creative = new BookWall("creative", 850);

    function BookWall(_type, _wallWidth)
    {
        var _p = BookWall.prototype = this;
        var _isInit = false;

        var _isLocking = false;

        var _dom;

        var Doms =
        {
        };

        var _tlStageIn;

        var _currentMode;

        var _bookList;

        var _imageRowList = [];
        var _selectedList = [];

        var _lastSelectedID;
        var _lastSelectedDom;

        _p.stageIn = function (cb, option)
        {
            if (!_isInit) loadAndBuild(stageIn_start);
            else stageIn_start();

            function stageIn_start()
            {
                _isLocking = true; MainFrame.selectOnMenu(_type);

                $("#WORK_AREA").append(_dom);

                refreshWall(function()
                {
                    _p.windowResize();

                    _tlStageIn.restart();

                    TweenLite.delayedCall(_tlStageIn.duration(), function ()
                    {
                        _isLocking = false;
                        if (cb)cb.apply();
                    });
                }, _lastSelectedID);
            }
        };

        _p.stageOut = function (cb)
        {
            _isLocking = true;

            Panel.clear();

            _lastSelectedID = _selectedList[0]? _selectedList[0].getId(): null;

            //console.log(_lastSelectedID);

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
            build();
            _isInit = true;
            cb.apply();

            function build()
            {
                _dom = document.createElement("div");
                $("#invisible_container").append(_dom);
                _dom.className = "thumb_wall";

                $(_dom).css("width", _wallWidth).css("margin-left", -_wallWidth *.5);

                buildTimeline();
                bindFunc();

                if (_dom.parentNode) _dom.parentNode.removeChild(_dom);
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

        function refreshWall(cb, selectId)
        {
            var params = {type:_type};
            DataManager.execute("get_book_list", params, function(response)
            {
                console.info("response = " + JSON.stringify(response));

                _bookList = response.book_list;

                updateWall(selectId);
                //updateSelected();

                if(cb) cb.apply();


            });
        }

        function updateWall(selectId)
        {
            _dom.innerHTML = "";

            _selectedList = [];
            _imageRowList = [];

            var selectedDom;

            for(var i=0;i<_bookList.length;i++)
            {
                var obj = _bookList[i];
                var dom = new BookBlock(obj, updateSelected, _type, null);
                _dom.appendChild(dom);

                if(obj.id == selectId) selectedDom = dom;

                _imageRowList.push(dom);
            }

            to_normal();

            if(selectedDom)
            {
                $(selectedDom).click();

                var scrollTop = $(selectedDom).position().top;

                TweenMax.to("#WORK_AREA",.5, {scrollTop:scrollTop});
            }

            var container = $("#WORK_AREA")[0];

            $(container).scroll(function()
            {
               //console.log(container.scrollTop);
            });
        }

        function updateSelected(event, thumbDom, isOnImage)
        {
            var i, dom;

                for(i=0;i<_selectedList.length;i++)
                {
                    dom = _selectedList[i];
                    dom.setSelected(false);
                }

                var oldDom;
                if(_selectedList.length == 1) oldDom = _selectedList[0];

                _selectedList = [];
                if(thumbDom)
                {
                    _selectedList.push(thumbDom);
                    thumbDom.setSelected(true);
                    if(oldDom == thumbDom)
                    {
                        if(isOnImage)
                        {
                            toImageMode();
                        }
                        else
                        {
                            modifyBook(_selectedList[0]);
                        }
                    }
                }

            updatePanel();
        }


        function updatePanel()
        {
            if(_selectedList.length == 0)
            {
                to_normal();
            }
            else if(_selectedList.length == 1)
            {
                to_singleSelected();
            }
        }

        function to_normal()
        {
            _currentMode = "normal";

            Panel.clear();

            Panel.addButton("新增作品集", function()
            {
               addBook();
            });
        }

        function to_singleSelected()
        {
            _currentMode = "single";

            Panel.clear();

            Panel.addButton("新增作品集", function()
            {
                addBook();
            });

            Panel.addButton("修改文字內容", function()
            {
                modifyBook(_selectedList[0]);
            });

            Panel.addButton("檢視圖片內容", function()
            {
                toImageMode();
            });

            Panel.addButton("刪除", function()
            {
                deleteBook(_selectedList[0]);
            });
        }

        function toImageMode()
        {
            var imageRow = _selectedList[0];
            var id = imageRow.getId();
            var bookName = "book_" + id;

            Main.addStageDefine(bookName, _type);

            Core.toStage("/" + bookName);
        }


        function addBook()
        {
            var params = {type:_type, title:"", description:"", date:""};

            DataManager.execute("add_book", params, function(response)
            {
                //console.log("res = " + response.res);
                if(response.res == "ok")
                {
                    Main.getBookList(refreshWall);
                }
                else
                {
                    alert(response.res);
                }
            });
        }

        function modifyBook(imageRow)
        {
            MainFrame.switchBookDialog(true, cbConfirm, null, imageRow.data.title, imageRow.data.date, imageRow.data.description);

            function cbConfirm(newTitle, newDate, newDescription)
            {
                console.log(newDescription);

                var id = imageRow.getId();

                var params = {id:id, type:_type, title:newTitle, date:newDate, description:newDescription};

                DataManager.execute("add_book", params, function(response)
                {
                    //console.log("res = " + response.res);
                    if(response.res == "ok")
                    {
                        refreshWall();
                    }
                    else
                    {
                        alert(response.res);
                    }
                });

            }
        }

        function deleteBook(imageRow)
        {
            if(confirm("確定要刪除選取的項目嗎?")) execute();


            function execute()
            {
                var id = imageRow.getId();

                var params = {id:id, type:_type};

                DataManager.execute("delete_book", params, function(response)
                {
                    //console.log("res = " + response.res);
                    if(response.res == "ok")
                    {
                        Main.getBookList(refreshWall);
                    }
                    else
                    {
                        alert(response.res);
                    }
                });
            }



        }

        /** resize and deform **/
        function windowResize()
        {
        }
    }

}());



(function(){

    window.BookBlock = BookBlock;

    function BookBlock(data, cb_clicked, type, className)
    {
        var _dom = document.createElement("div");
        _dom.className = className? className: "book_block";

        var Doms = {};

        if(data.title == null) data.title = "";
        if(data.description == null) data.description = "";

        var _p = BookBlock.prototype = _dom;
        _p.data = data;
        var _id = data.id;
        var _type = type;
        var _url = "uploads/book_" + data.id + "/thumb_"+data.cover_id+".jpg";


        _dom.innerHTML = MainFrame.Doms.bookBlockSample.innerHTML;

        Doms.thumbImage = Core.extract(".thumb", _dom);
        Doms.numValue = Core.extract(".num_value", _dom);
        Doms.titleValue = Core.extract(".title_value", _dom);
        Doms.dateValue = Core.extract(".date_value", _dom);
        Doms.descriptionValue = Core.extract(".description_value", _dom);
        Doms.bookId = Core.extract(".bookid_value", _dom);

        Doms.numValue.innerHTML = data.num_images;
        Doms.titleValue.innerHTML = data.title;
        Doms.dateValue.innerHTML = data.date;
        Doms.descriptionValue.innerHTML = data.description;
        Doms.bookId.innerHTML = "book_" + data.id;

        if(data.cover_id != null && data.cover_id != "")
        {
            $(Doms.thumbImage).css("background", "url(uploads/book_" + data.id + "/thumb_"+data.cover_id+".jpg?v="+Math.random()+")");
        }

        _p.selected = false;

        // $(Doms.thumbImage).css("background", "url("+_url+")");

        _p.getId = function(){ return _id; }


        $(_dom).click(function(event)
        {
            _p.selected = !_p.selected;
            $(_dom).toggleClass("selected", _p.selected);

            var isOnImage = event.target == Doms.thumbImage;

            if(cb_clicked) cb_clicked.apply(null, [event, _dom, isOnImage]);

        });

        _p.setValue = function(title, description)
        {

        };

        _p.setSelected = function(b)
        {
            _p.selected = b;
            $(_dom).toggleClass("selected", _p.selected);
        };

        _p.refreshImage = function()
        {
            Doms.thumbImage.src = _url + "?v=" + Math.random();
        };

        _p.refreshImage();


        return _dom;
    }
}());

