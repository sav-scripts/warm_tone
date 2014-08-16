/**
 * Created by index-20 on 2014/4/18.
 */
(function(){
    "use strict";

    var _p = window.DataManager = {};

    var _defaultCloseLoading = true;

    _p.execute = function(scriptName, params, cb_yes, cb_fail, closeLoading, progressString)
    {
        if(progressString == null) progressString = "";
        SimplePreloading.setProgress(progressString);
        SimplePreloading.show();

        var url = "php/"+scriptName+".php";
        var method = "POST";

        //url = _p.getSSLPath() + url;

        $.ajax(
            {
                url: url,
                type: method,
                data: params,
                dataType: "json"
            })
            .done(function(response)
            {
                if(closeLoading || (closeLoading == null && _defaultCloseLoading)) SimplePreloading.hide();
                if(cb_yes != null) cb_yes.apply(null, [response]);

            })
            .fail(function()
            {
                console.log("fail when executing: " + url);
                if(closeLoading || (closeLoading == null && _defaultCloseLoading)) SimplePreloading.hide();
                if(cb_fail) cb_fail.apply(null);
            });
    };

}());
