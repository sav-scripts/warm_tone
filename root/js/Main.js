/**
 * Created by index-20 on 2014/4/24.
 */
(function(){

    var _p = window.Main ={};

    var _bookList;

    _p.init = function()
    {


        /** site define **/
        Core.defaultStageName = "Home";
        Core.stageDefine =
        {
            "Home":{},
            "Collection":{},
            "CollectionImages":{},
            "Creative":{},
            "CreativeImages":{},
            "Wedding":{},
            "Photograph":{},
            "Profile":{},
            "Contact":{}
            /*
             "Intro":{},
             "Comment":{},
             "Signin":{},
             "Product_1":{className:"Product", option:{index:1}},
             "Product_2":{className:"Product", option:{index:2}},
             "Product_3":{className:"Product", option:{index:3}},
             "Product_4":{className:"Product", option:{index:4}},
             "Recommend":{allowReenter:true}
             */
        };

        Core.siteMap =
        {
        };

        Core.viewPort =
        {
            minWidth:1000,
            minHeight:600,
            x:0,
            y:0,
            width:1000,
            height:600
        };


        //SimplePreloading.show();
        getBookList(function()
        {
            MainFrame.stageIn(function()
            {
                Core.start("Home", true, cbCompleteStageDefine);
            });
        });


        function cbCompleteStageDefine(pathArray)
        {
            var path = pathArray[1];

            for(var i=0;i<_bookList.length;i++)
            {
                var obj = _bookList[i];
                if(path == ("book_" + obj.id))
                {
                    addImageScroll(obj.id, obj.type, obj.title, obj.date);
                }

                if(path == ("slide_" + obj.id))
                {

                    addImageCycle(obj.id);
                }
            }
        }
    }


    function getBookList(cb)
    {
        DataManager.execute("get_book_list", {fields:"id,type,title,date", ignore_empty:"1"}, function(response)
        {
//            console.log(JSON.stringify(response));

            _bookList = response.book_list;
            if(cb != null) cb.apply();
        });
    }


    function addImageScroll(bookId, type, title, date)
    {
        var bookName = "book_" + bookId;
        if(!Core.stageDefine[bookName])
        {
            Core.stageDefine[bookName] = {};
            Core.completeStageDefine(bookName, true);
            window[bookName] = new ImageScroll(bookId, type, title, date);
        }
    }


    function addImageCycle(bookId)
    {
        var listName = "slide_" + bookId;
        var bookName = "book_" + bookId;
        if(!Core.stageDefine[bookName])
        {
            Core.stageDefine[listName] = {};
            Core.completeStageDefine(listName, true);
            window[listName] = new ImageCycle(bookName, "/Creative");
        }
    }

}());