(function(){

    "use strict";

    var Core = window.Core = {};

    Core.version = "0.0.1";

    /** site define **/
    Core.defaultStageName = "Index";
    Core.stageDefine = null;

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


    /** private params **/
    var _currentStage;
    var _currentStageName;
    var _stageLocking = false;

    var _currentRoute;

    var _cbStageInComplete;

    var _cbCompleteStageDefind;

    var _extraOptions;

    var _useDeepLink = false;

    /** stage define fix **/
    function fixStageDefine(addIntoSiteMap)
    {
        var key;
        for(key in Core.stageDefine)
        {
            completeStageDefine(key, addIntoSiteMap)
        }
    }

    Core.completeStageDefine = completeStageDefine;
    function completeStageDefine(key, addIntoSiteMap)
    {
        var obj = Core.stageDefine[key];
        if(!obj.className) obj.className = key;
        if(addIntoSiteMap && !Core.siteMap[key]) Core.siteMap[key] = {"allowReenter":obj.allowReenter, "userReenterFunc":obj.useReenterFunc};
    }

    /** methods for project **/
    Core.extract = function(selector, sourceDom, parentDom, domIndex)
    {
        if(domIndex == null) domIndex = 0;
        if(sourceDom == null) sourceDom = document;

        var dom = $(sourceDom).find(selector).get(domIndex);
        if(!dom) console.error("can't find dom, selector: " + selector + ", source: " + sourceDom);

        Core.getInitValue(dom);

        if(parentDom != null) parentDom.appendChild(dom);

        return dom;
    };

    Core.getInitValue = function(dom)
    {
        var init = dom.init = {};
        var geom = dom.geom = {};

        if(dom.currentStyle)
        {
            geom.w = init.w = getValue(dom.currentStyle.width);
            geom.h = init.h = getValue(dom.currentStyle.height);
            geom.ml = init.ml = getValue(dom.currentStyle.marginLeft);
            geom.mt = init.mt = getValue(dom.currentStyle.marginTop);
            geom.mr = init.mr = getValue(dom.currentStyle.marginRight);
            geom.mb = init.mb = getValue(dom.currentStyle.marginBottom);
            geom.t = init.t = getValue(dom.currentStyle.top);
            geom.l = init.l = getValue(dom.currentStyle.left);
            geom.r = init.r = getValue(dom.currentStyle.right);
            geom.b = init.b = getValue(dom.currentStyle.bottom);
            geom.scale = init.scale = 1;
        }
        else
        {
            geom.w = init.w = $(dom).width();
            geom.h = init.h = $(dom).height();
            geom.ml = init.ml = getValue($(dom).css("margin-left"));
            geom.mt = init.mt = getValue($(dom).css("margin-top"));
            geom.mr = init.mr = getValue($(dom).css("margin-right"));
            geom.mb = init.mb = getValue($(dom).css("margin-bottom"));
            geom.t = init.t = getValue($(dom).css("top"));
            geom.l = init.l = getValue($(dom).css("left"));
            geom.r = init.r = getValue($(dom).css("right"));
            geom.b = init.b = getValue($(dom).css("bottom"));
            geom.scale = init.scale = 1;
        }


//        console.log("width = " + $(dom).css("width"));
        //console.log("width = " + dom.currentStyle.width);

        function getValue(v)
        {
            var v2 = parseInt(v);
            if(isNaN(v2)) v2 = 0;
            return v2;
        }
    };

    Core.styleDic =
    {
        "l":"left",
        "r":"right",
        "t":"top",
        "b":"bottom",
        "ml":"margin-left",
        "mr":"margin-right",
        "mt":"margin-top",
        "mb":"margin-bottom",
        "w":"width",
        "h":"height"
    };

    Core.applyTransform = function(dom, scaleRate, styleList, percentStyleList)
    {
        var rate = (scaleRate != null)? dom.init.scale * scaleRate: dom.init.scale;

        var i, n, key, style;
        if(styleList)
        {
            n = styleList.length;
            for(i=0;i<n;i++)
            {
                key = styleList[i];
                style = Core.styleDic[key];
                dom.geom[key] = dom.init[key]*rate;
                $(dom).css(style, dom.geom[key]);
            }
        }

        if(percentStyleList)
        {
            n = percentStyleList.length;
            for(i=0;i<n;i++)
            {
                key = percentStyleList[i];
                style = Core.styleDic[key];
                dom.geom[key] = dom.init[key]*rate;
                $(dom).css(style, dom.geom[key] + "%");
            }
        }
    };

    Core.transformDom = function(dom, scaleRate, applyPosition, applyMargin, applyScale)
    {
        var rate = (scaleRate != null)? dom.init.scale * scaleRate: dom.init.scale;

        if(applyScale != false)
        {
            if(applyScale === true)
            {
                dom.geom.w = dom.init.w*rate;
                dom.geom.h = dom.init.h*rate;
                $(dom).css("width", dom.geom.w).css("height", dom.geom.h);
            }
            else
            {
                if(applyPosition.l){ dom.geom.l = dom.init.l*rate; $(dom).css("left", dom.geom.l); }
                if(applyPosition.t){ dom.geom.t = dom.init.t*rate; $(dom).css("top", dom.geom.t); }
            }
        }

        if(applyPosition != false)
        {
            if(applyPosition === true)
            {
                dom.geom.t = dom.init.t*rate;
                dom.geom.l = dom.init.l*rate;
                $(dom).css("top", dom.geom.t).css("left", dom.geom.l);
            }
            else
            {
                if(applyPosition.l){ dom.geom.l = dom.init.l*rate; $(dom).css("left", dom.geom.l); }
                if(applyPosition.t){ dom.geom.t = dom.init.t*rate; $(dom).css("top", dom.geom.t); }
                if(applyPosition.r){ dom.geom.r = dom.init.r*rate; $(dom).css("right", dom.geom.r); }
                if(applyPosition.b){ dom.geom.b = dom.init.b*rate; $(dom).css("bottom", dom.geom.b); }
            }
        }

        if(applyMargin != false)
        {
            if(applyMargin === true)
            {
                dom.geom.mt = dom.init.mt*rate;
                dom.geom.ml = dom.init.ml*rate;
                $(dom).css("margin-top", dom.geom.mt).css("margin-left", dom.geom.ml);
            }
            else
            {
                if(applyPosition.ml){ dom.geom.ml = dom.init.ml*rate; $(dom).css("margin-left", dom.geom.ml); }
                if(applyPosition.mt){ dom.geom.mt = dom.init.mt*rate; $(dom).css("margin-top", dom.geom.mt); }
                if(applyPosition.mr){ dom.geom.mr = dom.init.mr*rate; $(dom).css("margin-right", dom.geom.mr); }
                if(applyPosition.mb){ dom.geom.mb = dom.init.mb*rate; $(dom).css("margin-bottom", dom.geom.mb); }
            }
        }
    };

    Core.load = function(imageSetting, frames, cb, loadingStyleIndex, keepLoadingLive)
    {
        SimplePreloading.show(loadingStyleIndex);

        if(imageSetting != null)
        {
            Utility.preloadImages(imageSetting.list, loadFrame ,function(progress)
            {
                SimplePreloading.updateProgress(progress, imageSetting.startWeight, imageSetting.weight, loadingStyleIndex);
            });
        }
        else loadFrame(0);

        function loadFrame(index)
        {
            if(frames.length == 0)
            {
                if(!keepLoadingLive) SimplePreloading.hide(loadingStyleIndex);
                cb.apply(null); return;
            }
            if(index == null) index = 0;

            var frameDom = frames[index].dom = document.createElement("div");

            $(frameDom).load(frames[index].url, function()
            {
                $("#invisible_container").append(frameDom);
                $(frameDom).find("style").remove();
                $(frameDom).find("link").remove();

                $(frameDom).waitForImages(function()
                {
                    if(frameDom.parentNode) frameDom.parentNode.removeChild(frameDom);
                    index ++;
                    if(index >= frames.length)
                    {
                        if(!keepLoadingLive) SimplePreloading.hide(loadingStyleIndex);
                        cb.apply(null);
                    }
                    else loadFrame(index);
                }, function(loaded, count)
                {
                    var progress = (loaded/count*100) << 0;
                    SimplePreloading.updateProgress(progress, frames[index].startWeight, frames[index].weight, loadingStyleIndex);
                }, true);
            });
        }
    };

    /** public methods **/
    Core.start = function(firstPath, useDeepLink, cbCompleteStageDefind)
    {
        _useDeepLink = !(useDeepLink == false);
        _cbCompleteStageDefind = cbCompleteStageDefind;

        fixStageDefine(true);

        window.onresize = windowResize;
        windowResize();

        if(_useDeepLink)
        {
            Utility.onHashChange(onDeepLinkChange);
            toRoute(getPathRoute(Utility.getHash()));

        }
        else
        {
            toRoute(getPathRoute(firstPath));
        }
    };

    Core.toStage = function(targetPathName, extraOptions)
    {
        if(extraOptions) _extraOptions = extraOptions;

        if(_useDeepLink)
        {
            if(Utility.getHash() == targetPathName) toRoute(getPathRoute(targetPathName));
            else Utility.setHash(targetPathName);
        }
        else executePath(targetPathName);
    };

    function getPathRoute(pathName)
    {
        var route = [], stageObj, i,n;
        var array = pathName.split("/");
        if(array.length <=1 || array[1] == "")
        {
            route.push({stageName:Core.defaultStageName});
        }
        else
        {
            var isFound = doSearch();

            if(!isFound && _cbCompleteStageDefind)
            {
                _cbCompleteStageDefind.apply(null, [array]);
                doSearch();
            }
        }

        function doSearch()
        {
            n = array.length;
            var lastLocation = Core.siteMap;
            var isFound = false;
            for(i=1;i<n;i++)
            {
                var stageName = array[i];
                if(lastLocation[stageName])
                {
                    lastLocation = lastLocation[stageName];
                    stageObj =
                    {
                        stageName:stageName
                    };
                    route.push(stageObj);
                    isFound = true;
                }
                else
                {
                    break;
                }
            }

            return isFound;
        }

        if(route.length == 0) route.push({stageName:Core.defaultStageName});

        return route;
    }

    function toRoute(route)
    {
        if(_stageLocking) return;
        if(route.length == 0) return;

        var targetStageName;

        if(!_currentRoute)
        {
            _currentRoute = route;
            preExecuteStageFlow(_currentRoute.slice(0));
        }
        else
        {
            //console.log("check: ")

            var oldRoute = _currentRoute;
            _currentRoute = route;

            var oldStageObj = oldRoute[oldRoute.length-1];
            var targetStageObj = _currentRoute[_currentRoute.length-1];

            var oldStageName = oldStageObj.stageName;
            targetStageName = targetStageObj.stageName;

            var oldStageClassName = Core.stageDefine[oldStageName].className;
            var targetStageClassName = Core.stageDefine[targetStageName].className;

            if(oldStageObj.stageName == targetStageObj.stageName && !Core.stageDefine[oldStageName].allowReenter)
            {
            }
            else if(oldRoute.length == 1)
            {
                preExecuteStageFlow(_currentRoute.slice(0));
            }
            else if(oldStageClassName == targetStageClassName && !Core.stageDefine[oldStageClassName].allowReenter)
            {
                var option = Core.stageDefine[targetStageName].option;
                var sendingOption = {};
                var key;
                for(key in option){ sendingOption[key] = option[key]; }
                if(_extraOptions) for(key in _extraOptions){ sendingOption[key] = _extraOptions[key]; }
                _extraOptions = null;

                _currentStage.applyStageOption(sendingOption);
            }
            else
            {
                targetStageName = targetStageObj.stageName;
                var i, n = oldRoute.length-2;
                var flow = [], stageObj;
                for(i=n;i>=0;i--)
                {
                    /** warning, I need improve code here **/
                    /** here may need check if same node on new route, so we jump to new route start from that node **/

                    stageObj = oldRoute[i];
                    flow.push(stageObj);
                    if(stageObj.stageName == targetStageName)
                    {
                        preExecuteStageFlow(flow);
                        return;
                    }
                }

                flow = flow.concat(_currentRoute);
                preExecuteStageFlow(flow);
            }
        }
    }

    function preExecuteStageFlow(flow)
    {
        if(_extraOptions)
        {
            var stageObj = flow[flow.length -1];
            stageObj.option = _extraOptions;
            _extraOptions = null;
        }

        executeStageFlow(flow);
    }

    function executeStageFlow(flow)
    {
        //console.log("executeStageFlow");
        if(_stageLocking) return;
        //console.log("flow = " + JSON.stringify(flow));
        if(flow.length == 0) return;

        var stageObj = flow.shift();
        var targetStageName = stageObj.stageName;
        var className = Core.stageDefine[targetStageName].className;
        var currentClassName = _currentStageName? Core.stageDefine[_currentStageName].className: null;
        //console.log("className = " + className);


        var option = Core.stageDefine[targetStageName].option;
        if(option == undefined) option = {};

        if(stageObj.option != null)
        {
            for(var key in stageObj.option){ option[key] = stageObj.option[key]; }
        }

//    console.log("target className = " + className + ", currentClassName = " + currentClassName);

        if(!className) { alert("stage type: [" + className + "] is not defined"); return; }

        if(currentClassName == className)
        {
            window[className].reenter.apply(null, [option]);
            return;
        }
        else if(_currentStageName == targetStageName)
        {
            if(Core.stageDefine[targetStageName].allowReenter)
            {
                if(Core.stageDefine[targetStageName].useReenterFunc)
                {
                    window[className].reenter.apply();
                    return;
                }
            }
            else
            {
                if(flow.length > 0) preExecuteStageFlow(flow);
                return;
            }
        }

        _stageLocking = true;

        if(_currentStageName)
        {
            option.prevStageName = _currentStageName;
            option.prevClassName = Core.stageDefine[_currentStageName].className;
        }
        if(flow.length > 0) option.nextStageName = flow[0].stageName;

        var oldStage = _currentStage;

        _currentStageName = targetStageName;
        _currentStage = window[className];

        if(!_currentStage) alert("stage class: [" + className + "] not found.");

        option.targetStageName = _currentStageName;
        option.targetClassName = className;

        if(oldStage) oldStage.stageOut(newStageIn, option);
        else newStageIn();

        function newStageIn()
        {
            _currentStage.stageIn(function()
            {
                _stageLocking = false;

                if(flow.length > 0)
                {
                    preExecuteStageFlow(flow);
                }
                else if(_cbStageInComplete != null)
                {
                    var func = _cbStageInComplete;
                    _cbStageInComplete = null;
                    func.apply();
                }

            }, option);
        }
    }

    function onDeepLinkChange()
    {
        var path = Utility.getHash();
        executePath(path);
    }

    function executePath(path)
    {
        var route = getPathRoute(path);
        if(!route || route.length == 0) return;

        if(_stageLocking)
        {
            _cbStageInComplete = function()
            {
                toRoute(route);
            };
        }
        else
        {
            toRoute(route);
        }
    }

    function windowResize()
    {
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();

        var viewPort = Core.viewPort;

        viewPort.windowWidth = windowWidth;
        viewPort.windowHeight = windowHeight;
        viewPort.width = (windowWidth > viewPort.minWidth)? windowWidth: viewPort.minWidth;
        viewPort.height = (windowHeight > viewPort.minHeight)? windowHeight: viewPort.minHeight;

        viewPort.halfWidth = (viewPort.width*.5)<<0;
        viewPort.halfHeight = (viewPort.height*.5)<<0;

        viewPort.x = ((windowWidth - viewPort.width)*.5)<<0;
        viewPort.y = ((windowHeight - viewPort.height)*.5)<<0;

        var maxWidth = 1680;
        var maxHeight = 900;
        var scaleProgress;

        var scaleRateW = (viewPort.width - viewPort.minWidth) /  (maxWidth - viewPort.minWidth);
        var scaleRateH = (viewPort.height - viewPort.minHeight) /  (maxHeight - viewPort.minHeight);
        scaleProgress = (scaleRateW > scaleRateH)? scaleRateH: scaleRateW;

        viewPort.scaleProgress = scaleProgress;

        $("#stage_container").width(viewPort.width).height(viewPort.height);

        if(viewPort.width == viewPort.minWidth) $("body").css("overflow-x", "auto");
        else $("body").css("overflow-x", "hidden");

        if(viewPort.height == viewPort.minHeight) $("body").css("overflow-y", "auto");
        else $("body").css("overflow-y", "hidden");

        if(_currentStage)_currentStage.windowResize();

        MainFrame.windowResize();
    }


}());