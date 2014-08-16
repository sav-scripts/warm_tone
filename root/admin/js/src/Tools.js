/**
 * Created by sav on 2014/7/20.
 */
(function(){

    window.Tools = {};

    Tools.loadImage_base64 = function(fileData, cb)
    {
            var reader = new FileReader();

            reader.onload = function (event)
            {
                var src = event.target.result;
                src = src.replace("data:image/png;base64,", "");
                src = src.replace("data:image/jpeg;base64,", "");

               cb.apply(null, [src]);
            };

            reader.readAsDataURL(fileData);

        /*
        function imageReady()
        {
            var resizeRate = 1;
            var canvas = document.createElement("canvas");
            canvas.width = parseInt(image.width *resizeRate);
            canvas.height = parseInt(image.height *resizeRate);
            var ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width *resizeRate, image.height *resizeRate);

            var src = canvas.toDataURL();
            src = src.replace("data:image/png;base64,", "");

            //imageReady(canvas);

            //console.log(src);


            var params = {image_before:src, image_after:src};

            DataManager.execute("upload_image", params, function(response)
            {
                //console.log("res = " + response.res);
                if(response.res == "ok")
                {
                    console.log("ok");
                }
                else
                {
                    alert(response.res);
                }
            });


        }
        */
    };

    Tools.showImage = function(url)
    {
        var dom = document.createElement("div");
        dom.className = "full_container";

        var image = document.createElement("img");
        image.className = "center_block";
        image.onload = function()
        {
            var maxWidth = $(window).width() - 100;
            var maxHeight = $(window).height() - 100;

            var bound = Geom.getBound_insideFrame(maxWidth, maxHeight, image.width, image.height);
            dom.appendChild(image);

            $(image).css("margin-left", -bound.width *.5).css("margin-top", -bound.height *.5).css("width", bound.width).css("height", bound.height);
        };
        image.src = url;

        TweenMax.from(dom,.5, {alpha:0});

        $("body").append(dom);

        $(dom).click(function()
        {
           $(dom).detach();
        });
    };


}());