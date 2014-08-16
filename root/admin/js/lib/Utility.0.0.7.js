/** Utility **/
(function(){

    var _p = window.Utility = {};

    var _hash = window.location.hash.replace("#", "");
    Utility.onHashChange = function(cb)
    {

        if ("onhashchange" in window) { // event supported?
            window.onhashchange = function () {
                hashChanged(window.location.hash);
            }
        }
        else { // event not supported:
            var storedHash = window.location.hash;
            window.setInterval(function () {
                if (window.location.hash != storedHash) {
                    storedHash = window.location.hash;
                    hashChanged(storedHash);
                }
            }, 100);
        }

        function hashChanged(string)
        {
            _hash = string.replace("#", "");
            cb.apply(null, [_hash]);
        }
    }

    Utility.getHash = function(){ return _hash; };
    Utility.setHash = function(targetHash)
    {
        window.location.hash = "#" + targetHash;
    };


    var _oldConsoleMethod = {};
    var _consoleMethods = {};
    _consoleMethods["log"] = "log";
    _consoleMethods["warn"] = "warn";
    _consoleMethods["error"] = "error";
    _consoleMethods["debug"] = "debug";
    _consoleMethods["info"] = "info";

    Utility.setConsoleMethod = function(methodName/*string*/, enableIt/*boolean*/)
    {
        (enableIt == true) ? console[methodName] = _oldConsoleMethod[methodName] : console[methodName] = function(){};
    };

    Utility.disableAllConsoleMethods = function()
    {
        for(var key in _consoleMethods) this.setConsoleMethod(key, false);
    };

    Utility.enableAllConsoleMethods = function()
    {
        for(var key in _consoleMethods) this.setConsoleMethod(key, true);
    };

    (function()	{
        /** fix console methods for some browser which don't support it **/
        if(!window.console){
            window.console = {};
            for(var key in _consoleMethods){ console[_consoleMethods[key]] = function(){}; }
        }

        // store old console methods
        for(var key in _consoleMethods){ _oldConsoleMethod[_consoleMethods[key]] = console[_consoleMethods[key]]; }

        /** fix Array indexOf method **/
        if (!window.Array.prototype.indexOf)
        {
            window.Array.prototype.indexOf = function(elt /*, from*/)
            {
                var len = this.length >>> 0;

                var from = Number(arguments[1]) || 0;
                from = (from < 0)
                    ? Math.ceil(from)
                    : Math.floor(from);
                if (from < 0)
                    from += len;

                for (; from < len; from++)
                {
                    if (from in this &&
                        this[from] === elt)
                        return from;
                }
                return -1;
            };
        }
    }());

    Utility.getPath = function()
    {
        var array = String(window.location).split("/");
        array.pop();
        return array.join("/") + "/";
    };

    Utility.urlParams = null;
    Utility.getUrlParams = function()
    {
        if(Utility.urlParams) return Utility.urlParams;
        var url = decodeURIComponent(window.location.href);
        var paramString = url.split("?")[1];
        if(!paramString) { Utility.urlParams = {}; return Utility.urlParams; }
        paramString = paramString.split("#")[0];
        Utility.urlParams = {};
        var array = paramString.split("&");

        for(var i=0;i<array.length;i++)
        {
            var array2 = array[i].split("=");
            Utility.urlParams[array2[0]] = array2[1];
        }
        return Utility.urlParams;
    };

    Utility.isLocalhost = (function()
    {
        var address = window.location.toString().split("/")[2];
        return (address == "localhost" || address.split(".")[0] == "192");
    }());

    Utility.protocol = (function()
    {
        return window.location.toString().split(":")[0];
    }());

    Utility.preloadImages = function(urlList, cb, cbUpdateProgress, allowError)
    {
        if(allowError == null) allowError = true;
        if(!urlList || urlList.length == 0){ if(cb) cb.apply(); return; }

        var i = 0;
        loadUrl();
        function loadUrl()
        {
            if(cbUpdateProgress) cbUpdateProgress.apply(null, [(i/urlList.length*100)<<0]);
            if(i >= urlList.length) { if(cb)cb.apply(); return; }

            var url = urlList[i];
            var setting = null;

            if(!(typeof url === "string"))
            {
                setting = url;
                url = setting.url;
            }

            i++;
            var imageDom = new Image();
            imageDom.onload = toNext;
            if(allowError) imageDom.onerror = function(){ console.error("load image error: ["+url+"]"); toNext(); };
            imageDom.src = url;

            function toNext()
            {
                if(setting != null) setting.collector[setting.name] = imageDom;
                imageDom.onerror = null; imageDom.onload = null; loadUrl();
            }
        }
    };

    Utility.callScript = function(url, dataObj, cb, method, cbFail)
    {
        if(!$.ajax){ console.error("jquery need be loaded first"); return; }

        if(method == null) method = "GET";
        var timeout = 20000;
        var dataType = "text";

        if(dataObj) console.info("sending data: " + JSON.stringify(dataObj));

        $.ajax({
            type: method,
            dataType: dataType,
            timeout: timeout,
            url: url,
            data: dataObj,
            success: dataLoaded,
            error:ajaxError
        });

        function dataLoaded(data, textStatus, jqXHR)
        {
            data = data.replace(/\t/g, "");
            console.info("data = " + data);

            var obj = JSON.parse(data);
            if(cb != null) cb.apply(null, [obj]);
        }

        function ajaxError(evt)
        {
            console.log("ajax error, status: " + evt.status + ", statusText: " + evt.statusText);
            if(cbFail) cbFail.apply();
        }
    }

    Utility.shuffleArray = function (o)
    {
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    Utility.loadScript = function(type, url, cbSuccess)
    {
        var oXmlHttp = getHttpRequest() ;
        oXmlHttp.onreadystatechange = function()
        {
            if ( oXmlHttp.readyState == 4 )
            {
                if ( oXmlHttp.status == 200 || oXmlHttp.status == 304 )
                {
                    if(cbSuccess) cbSuccess.apply(null, [oXmlHttp.responseText]);
                }
                else alert( 'XML request error: ' + oXmlHttp.statusText + ' (' + oXmlHttp.status + ')' + ", url: " + url ) ;
            }
        }

        try{
            oXmlHttp.open('GET', url, true);
            oXmlHttp.send(null);
        }
        catch(e)
        {
            if(!("withCredentials" in oXmlHttp))
            {
                if(window.XDomainRequest)
                {
                    sendXDomainRequest(url, function(responseText)
                    {
                        if(cbSuccess) cbSuccess.apply(null, [oXmlHttp.responseText]);
                    });
                }
                else alert("XMLHttpRequest error: " + e + ", on url: " + url);
            }
            else alert("XMLHttpRequest error: " + e + ", on url: " + url);
        }
    }

    Utility.includeJS = function(url, content, id)
    {
        var headDom = document.getElementsByTagName('HEAD').item(0);
        var scriptDom = document.createElement( "script" );
        scriptDom.language = "javascript";
        scriptDom.type = "text/javascript";
        if(id) scriptDom.id = id;
        scriptDom.defer = true;
        scriptDom.text = content;
        headDom.appendChild( scriptDom );

        console.info("JS embed: [" + url + "]");
    }

    Utility.includeCSS = function(url, content, id)
    {
        var headDom = document.getElementsByTagName('HEAD').item(0);

        var scriptDom=document.createElement("link");
        scriptDom.setAttribute("rel", "stylesheet");
        scriptDom.setAttribute("type", "text/css");
        scriptDom.setAttribute("href", url);
        if(id) scriptDom.setAttribute("id", id);
        headDom.appendChild( scriptDom );;

        console.info("CSS embed: [" + url + "]");
    }

    /*** private methods ***/
    function sendXDomainRequest(url, cbSuccess, timeout)
    {
        var xdr = new XDomainRequest();

        xdr.onload = function(){ if(cbSuccess) cbSuccess.apply(null, [xdr.responseText]); }
        xdr.onerror = function(e){ alert("XDomainRequest error on url: " + url); }
        xdr.ontimeout = function(){ alert("XDomainRequest timeout on url: " + url); }

        xdr.timeout = (timeout != null)? timeout: 10000;
        xdr.open("GET", url);
        xdr.send();
    }

    function getHttpRequest()
    {
        if ( window.XMLHttpRequest )
            return new XMLHttpRequest() ;
        else if ( window.ActiveXObject )
            return new ActiveXObject("Microsoft.XMLHTTP");
        else alert("browser doesn't support XmlHttpRequest method");
    }

}());

/** PatternSamples **/
(function(){

var PatternSamples = window.PatternSamples = {};
PatternSamples["email"] = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
PatternSamples["phone"] = /^(09)[0-9]{8}$/;
PatternSamples["number"] = /[0-9]/g;
PatternSamples["nonNumber"] = /[^0-9]/g;
PatternSamples["onlySpace"] = /^\s*$/;
PatternSamples["localPhone"] = /^(0)\d{1,3}(-)\d{5,8}$/;

}());

/** Support Detect **/
(function()
{
    var SupportDetect = window.SupportDetect = {};
    SupportDetect.recoard = {};
    SupportDetect.get = function(featureName)
    {
        if(SupportDetect.recoard[featureName] != undefined) return SupportDetect.recoard[featureName];
        if(SupportDetect[featureName] != null) return SupportDetect[featureName].apply();
        console.error("feature name: [" + featureName + "] is not defined");
        return null;
    };

    SupportDetect.transform = function()
    {
        var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
        for(var i = 0; i < prefixes.length; i++) {
            if(document.createElement('div').style[prefixes[i]] !== undefined) {
                SupportDetect.recoard["transform"] = prefixes[i];
                return prefixes[i];
            }
        }

        SupportDetect.recoard["transform"] = false;
        return false;
    };

    SupportDetect.canvas = function()
    {
        SupportDetect.recoard["canvas"] = !!document.createElement('canvas').getContext;
        return SupportDetect.recoard["canvas"];
    };

    SupportDetect.canvas = function()
    {
        SupportDetect.recoard["video"] = !!document.createElement('video').canPlayType;;
        return SupportDetect.recoard["video"];
    };

}());


/** Browser Detect **/
(function(){
    window.BrowserDetect = {
        init: function () {
            this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
            this.version = this.searchVersion(navigator.userAgent)
                || this.searchVersion(navigator.appVersion)
                || "an unknown version";
            this.OS = this.searchString(this.dataOS) || "an unknown OS";
            this.isMobile = (function() {
                var check = false;
                (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
                return check; }());
        },
        searchString: function (data) {
            for (var i=0;i<data.length;i++)	{
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) != -1)
                        return data[i].identity;
                }
                else if (dataProp)
                    return data[i].identity;
            }
        },
        searchVersion: function (dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index == -1) return;
            return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
        },
        dataBrowser: [
            {
                string: navigator.userAgent,
                subString: "Chrome",
                identity: "Chrome"
            },
            { 	string: navigator.userAgent,
                subString: "OmniWeb",
                versionSearch: "OmniWeb/",
                identity: "OmniWeb"
            },
            {
                string: navigator.vendor,
                subString: "Apple",
                identity: "Safari",
                versionSearch: "Version"
            },
            {
                prop: window.opera,
                identity: "Opera",
                versionSearch: "Version"
            },
            {
                string: navigator.vendor,
                subString: "iCab",
                identity: "iCab"
            },
            {
                string: navigator.vendor,
                subString: "KDE",
                identity: "Konqueror"
            },
            {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "Firefox"
            },
            {
                string: navigator.vendor,
                subString: "Camino",
                identity: "Camino"
            },
            {		// for newer Netscapes (6+)
                string: navigator.userAgent,
                subString: "Netscape",
                identity: "Netscape"
            },
            {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "Explorer",
                versionSearch: "MSIE"
            },
            {
                string: navigator.userAgent,
                subString: "Gecko",
                identity: "Mozilla",
                versionSearch: "rv"
            },
            { 		// for older Netscapes (4-)
                string: navigator.userAgent,
                subString: "Mozilla",
                identity: "Netscape",
                versionSearch: "Mozilla"
            }
        ],
        dataOS : [
            {
                string: navigator.platform,
                subString: "Win",
                identity: "Windows"
            },
            {
                string: navigator.platform,
                subString: "Mac",
                identity: "Mac"
            },
            {
                string: navigator.userAgent,
                subString: "iPhone",
                identity: "iPhone/iPod"
            },
            {
                string: navigator.platform,
                subString: "Linux",
                identity: "Linux"
            }
        ]

    };
    BrowserDetect.init();
}());
