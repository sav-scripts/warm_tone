(function(){

    var _p = window.Geom = {};

    /** 等比 resize 寬高至能夠包含 frame **/
    _p.getBound_containFrame = function(frameWidth, frameHeight, w, h)
    {
        var rate = frameWidth / frameHeight;
        var rate2 = w/h;
        var tw, th;

        if(rate > rate2)
        {
            tw = frameWidth;
            th = tw/rate2;
        }
        else
        {
            th = frameHeight;
            tw = th*rate2;
        }

        return {
            x: (frameWidth - tw) * .5,
            y: (frameHeight - th) * .5,
            width: tw,
            height: th,
            scale: tw/w
        };
    };


    /** 等比 resize 寬高至 frame 內**/
    _p.getBound_insideFrame = function(frameWidth, frameHeight, w, h)
    {
        var rate = frameWidth / frameHeight;
        var rate2 = w/h;
        var tw, th;

        if(rate > rate2)
        {
            th = frameHeight;
            tw = th*rate2;
        }
        else
        {
            tw = frameWidth;
            th = tw/rate2;
        }

        return {
            x: (frameWidth - tw) * .5,
            y: (frameHeight - th) * .5,
            width: tw,
            height: th,
            scale: tw/w
        };
    };

    _p.getMoveableBound_containFrame = function(frameWidth, frameHeight, w, h)
    {
        return {
            left:frameWidth - w,
            right:0,
            top:frameHeight - h,
            bottom:0
        };
    };

}());
