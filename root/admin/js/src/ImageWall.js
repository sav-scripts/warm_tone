// JavaScript Document
(function ()
{
    "use strict";

    window.ImageWall = ImageWall;

    window.Home = new ImageWall("home");

    window.Collection = new ImageWall("collection", 190, 190, 960);
    //window.Creative = new ImageWall("creative", 300, 200, 1050, null, null, true);

    function ImageWall(_type, _thumbWidth, _thumbHeight, _wallWidth, _table, _bookId, _withText)
    {
        if(!_thumbWidth) _thumbWidth = 100;
        if(!_thumbHeight) _thumbHeight = 100;
        if(!_wallWidth) _wallWidth = 850;
        if(!_table) _table = _type;


        var _p = ImageWall.prototype = this;
        var _isInit = false;

        var _isLocking = false;


        var _dom;

        var Doms =
        {
        };

        var _tlStageIn;

        var _imageIdList = [];
        var _selectedList = [];
        var _thumbBlockList = [];

        var _currentMode = null;

        var _uploadMode;

        var _inMultiSelectMode = false;

        _p.stageIn = function (cb, option)
        {
            if (!_isInit) loadAndBuild(stageIn_start);
            else stageIn_start();

            function stageIn_start()
            {
                _isLocking = true;

                MainFrame.selectOnMenu(_type);

                refreshWall(function()
                {
                    $("#WORK_AREA").append(_dom);
                    _p.windowResize();

                    _tlStageIn.restart();

                    TweenLite.delayedCall(_tlStageIn.duration(), function ()
                    {
                        _isLocking = false;
                        if (cb)cb.apply();
                    });
                });



            }
        };

        _p.stageOut = function (cb)
        {
            _isLocking = true;

            Panel.clear();

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

        return _p;

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

                Doms.input = document.createElement("input");
                Doms.input.type = "file";
                Doms.input.accept = "image/*";
                Doms.input.multiple = true;
                Doms.input.addEventListener("change", function(event)
                {
                    uploadFiles(this.files);

                    /*
                    Tools.loadImage_base64(Doms.input, function(src)
                    {
                        if(_uploadMode == "add")
                        {
                            addImage(src);
                        }
                        else if(_uploadMode == "modify")
                        {
                            addImage(src, _selectedList[0].getId());
                        }
                    });
                    */
                });

                $("#invisible_container").append(Doms.input);



                buildTimeline();
                bindFunc();

                if (_dom.parentNode) _dom.parentNode.removeChild(_dom);
            }
        }

        function uploadFiles(files)
        {
            var index = -1;

            uploadOne();

            function uploadOne()
            {
                index++;
                if(index >= files.length)
                {
                    complete();
                }
                else
                {
                    var progressString = "圖片 "+(index+1) + " / " + files.length +" 處理中";
                    Tools.loadImage_base64(files[index], function(src)
                    {
                        if(_uploadMode == "add")
                        {
                            addImage(src, null, progressString, uploadOne);
                        }
                        else if(_uploadMode == "modify")
                        {
                            addImage(src, _selectedList[0].getId(), null, uploadOne);
                        }
                    });

                }
            }

            function complete()
            {
                if(_uploadMode == "modify")
                {
                    _selectedList[0].refreshImage();
                }
                else
                {
                    updateWall();
                }
            }
        }


        function addImage(src, id, progressString, cb)
        {
            var params = {type:_type, table:_table, image:src, thumb_width:_thumbWidth, thumb_height:_thumbHeight};

            if(id) params.id = id;
            if(_bookId) params.book_id = _bookId;

            DataManager.execute("add_image", params, function(response)
            {
                //console.log("res = " + response.res);
                //console.log("size = " + response.srcWidth + ", " + response.srcHeight);

                if(response.res == "ok")
                {
                    if(_uploadMode == "add")
                    {
                        //_imageIdList.push(response.id);
                        _imageIdList.push({id:response.id});
                        //updateWall();
                    }

                    if(cb)cb.apply();
                }
                else
                {
                    alert(response.res);
                }
            }, function()
            {
                alert("upload fail");
            }, null, progressString);
        }

        function updateWall()
        {
            _dom.innerHTML = "";

            _thumbBlockList = [];
            _selectedList = [];

            for(var i=0;i<_imageIdList.length;i++)
            {
                var obj = _imageIdList[i];
                var dom = new ThumbBlock(obj, updateSelected, _table, "thumb_" + _type, _withText);
                _dom.appendChild(dom);

                _thumbBlockList.push(dom);
            }
        }

        function updateSelected(event, thumbDom)
        {
            var i, dom;
            if(_inMultiSelectMode == false)
            {
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
                    if(oldDom == thumbDom) Tools.showImage("uploads/"+_table+"/image_" + _selectedList[0].getId() + ".jpg?v="+Math.random());
                }

            }
            else
            {
                _selectedList = [];

                for(i=0;i<_thumbBlockList.length;i++)
                {
                    dom = _thumbBlockList[i];
                    if(dom.selected)
                    {
                        _selectedList.push(dom);
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
            else
            {
                to_multipleSelected();
            }
        }

        function refreshWall(cb)
        {
            var params = {type:_type, table:_table};
            DataManager.execute("get_data", params, function(response)
            {
                console.log("response = " + JSON.stringify(response));

                _imageIdList = response.images;

                updateWall();
                updateSelected();

                if(cb) cb.apply();


            });
        }

        function to_normal()
        {
            _currentMode = "normal";

            Panel.clear();

            addMultiSelectSwitch();

            Panel.addButton("新增", function()
            {
                _uploadMode = "add";
                Doms.input.multiple = true;
                Doms.input.click();
            });
        }

        function to_singleSelected()
        {
            _currentMode = "single";

            Panel.clear();

            addMultiSelectSwitch();

            Panel.addButton("新增", function()
            {
                _uploadMode = "add";
                Doms.input.multiple = true;
                Doms.input.click();
            });

            Panel.addButton("更換", function()
            {
                _uploadMode = "modify";
                Doms.input.multiple = false;
                Doms.input.click();
            });

            Panel.addButton("檢視", function()
            {
                Tools.showImage("uploads/"+_table+"/image_" + _selectedList[0].getId() + ".jpg?v="+Math.random());
            });

            if(_bookId)
            {
                Panel.addButton("設為封面", function()
                {
                    setCover();
                });
            }

            if(_withText)
            {
                Panel.addButton("修改文字內容", function()
                {
                    modifyText(_selectedList[0]);
                });
            }

            Panel.addButton("刪除", function()
            {
                deleteImages();
            });
        }


        function modifyText(thumbBlock)
        {
            MainFrame.switchBookDialog(true, cbConfirm, null, thumbBlock.data.title, thumbBlock.data.date, thumbBlock.data.description, true);

            function cbConfirm(newTitle, newDate, newDescription)
            {
                console.log(newDescription);

                var id = thumbBlock.data.id;

                var params = {id:id, table:_table, title:newTitle, description:newDescription};

                DataManager.execute("add_image", params, function(response)
                {
                    //console.log("res = " + response.res);
                    if(response.res == "ok")
                    {
                        //refreshWall();
                        thumbBlock.updateText(params.title, params.description);
                    }
                    else
                    {
                        alert(response.res);
                    }
                });

            }
        }

        function setCover()
        {
            var params = {book_id:_bookId, image_id:_selectedList[0].getId()};

            console.log("image id = " + params.image_id);

            DataManager.execute("set_cover", params, function(response)
            {
                console.log(JSON.stringify(response));

                if(response.res == "ok")
                {
                }
                else
                {
                    alert(response.res);
                }
            });


        }

        function to_multipleSelected()
        {
            _currentMode = "multiple";

            Panel.clear();

            addMultiSelectSwitch();

            Panel.addButton("刪除", function()
            {
                deleteImages();
            });
        }

        /*
        function unselectAll()
        {
            _selectedList = [];

            for(var i=0;i<_thumbBlockList.length;i++)
            {
                var dom = _thumbBlockList[i];
                dom.setSelected(false);
            }

            to_normal();
        }
        */

        function addMultiSelectSwitch()
        {
            if(_inMultiSelectMode)
            {

                Panel.addButton("切換成單選", function()
                {
                    _inMultiSelectMode = false;
                    updatePanel();
                });
            }
            else
            {

                Panel.addButton("切換成多選", function()
                {
                    _inMultiSelectMode = true;
                    updatePanel();
                });
            }
        }

        function deleteImages()
        {

            if(confirm("確定要刪除選取的 "+_selectedList.length+" 個項目嗎?")) execute();


            function execute()
            {
                var array = [];
                for(var i=0;i<_selectedList.length;i++)
                {
                    array.push(_selectedList[i].getId());
                }

                //var id = _selectedList[0].getId();

                var params = {id_list:array, type:_type, table:_table};
                if(_bookId) params.book_id = _bookId;

                DataManager.execute("delete_image", params, function(response)
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


(function(){

    window.ThumbBlock = ThumbBlock;

    function ThumbBlock(data, cb_clicked, tableName, className, _withText)
    {
        var _dom = document.createElement("div");
        _dom.className = className? className: "thumb_block";

        _dom.data = data;

        var _p = ThumbBlock.prototype = _dom;
        var _id = data.id;
        var _table = tableName;
        var _url = "uploads/"+_table+"/thumb_" + _id + ".jpg?v="+Math.random();

        _p.selected = false;

        var Doms = {};
        Doms.thumbImage = document.createElement("img");
        Doms.thumbImage.src = _url;
        _dom.appendChild(Doms.thumbImage);

        _p.getId = function(){ return _id; }

        if(_withText)
        {
            if(!data.title) data.title = "";
            if(!data.description) data.description = "";

            Doms.cover = $('<div class="book_thumb_cover"></div>')[0];

            Doms.title = $('<div class="book_thumb_title"></div>')[0];
            Doms.description = $('<div class="book_thumb_description"></div>')[0];

            _dom.appendChild(Doms.cover);
            _dom.appendChild(Doms.title);
            _dom.appendChild(Doms.description);

            TweenMax.set(Doms.cover, {autoAlpha:0});
            TweenMax.set(Doms.title, {autoAlpha:0});
            TweenMax.set(Doms.description, {autoAlpha:0});



            $(_dom).mouseover(function(event)
            {
                if($(_dom).has(event.relatedTarget).length) return;
                if(_dom == event.relatedTarget) return;

                TweenMax.to(Doms.cover,.5, {autoAlpha:1});
                TweenMax.to(Doms.title,.5, {autoAlpha:1});
                TweenMax.to(Doms.description,.5, {autoAlpha:1});
            });

            $(_dom).mouseout(function(event)
            {
                if($(_dom).has(event.relatedTarget).length) return;
                if(_dom == event.relatedTarget) return;

                TweenMax.killTweensOf(Doms.title);
                TweenMax.killTweensOf(Doms.description);

                TweenMax.to(Doms.cover,.5, {autoAlpha:0});
                TweenMax.to(Doms.title,.5, {autoAlpha:0});
                TweenMax.to(Doms.description,.5, {autoAlpha:0});
            });

            refreshText();
        }


        $(_dom).click(function(event)
        {
            _p.selected = !_p.selected;
            $(_dom).toggleClass("selected", _p.selected);

            if(cb_clicked) cb_clicked.apply(null, [event, _dom]);

        });

        _p.setSelected = function(b)
        {
            _p.selected = b;
            $(_dom).toggleClass("selected", _p.selected);
        };

        _p.refreshImage = function()
        {
            Doms.thumbImage.src = _url + "?v=" + Math.random();
        };

        _p.updateText = function(title, description)
        {
            data.title = title;
            data.description = description;

            refreshText();
        };

        function refreshText()
        {
            Doms.title.innerHTML = data.title;
            Doms.description.innerHTML = data.description.replace(/\r\n|\r|\n/g,"<br />");
        }

        return _dom;
    }
}());