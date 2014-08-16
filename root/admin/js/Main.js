/**
 * Created by index-20 on 2014/4/24.
 */
(function(){

    var _p = window.Main ={};

    var _bookList;

    _p.addStageDefine = addStageDefine;
    _p.getBookList = getBookList;

    _p.init = function()
    {

        /** site define **/
        Core.defaultStageName = "Home";
        Core.stageDefine =
        {
            "Home":{},
            "Collection":{},
            "Photograph":{},
            "Creative":{},
            "Wedding":{}
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


        SimplePreloading.show();

        getBookList(function()
        {
            MainFrame.stageIn(function()
            {
                Core.start("Home", true, cbCompleteStageDefine);
            });

        });

        /*
        MainFrame.stageIn(function()
        {
            Core.start("Home", true);
        });
        */

        function cbCompleteStageDefine(pathArray)
        {
            var path = pathArray[1];

            for(var i=0;i<_bookList.length;i++)
            {
                var obj = _bookList[i];
                var bookName = "book_" + obj.id;
                if(path == bookName)
                {
                    addStageDefine(obj.id, obj.type);
                }
            }
        }
    }

    function getBookList(cb)
    {
        DataManager.execute("get_book_list", {fields:"id,type"}, function(response)
        {
            _bookList = response.book_list;
            if(cb != null) cb.apply();
        });
    }


    function addStageDefine(bookId, type)
    {
        var bookName = "book_" + bookId;
        if(!Core.stageDefine[bookName])
        {
            Core.stageDefine[bookName] = {};
            Core.completeStageDefine(bookName, true);
            window[bookName] = new ImageWall(type, 300, 200, 1050, bookName, bookId);
        }
    }

}());