// JavaScript Document
(function () {
    "use strict";

    window.MainFrame = new MainFrame();

    function MainFrame() {
        var _p = MainFrame.prototype = this;
        var _isInit = false;

        var _isLocking = false;

        var _dom;

        var Doms = _p.Doms =
        {
        };

        var _tlStageIn;

        _p.stageIn = function (cb, option) {
            console.info("MainFrame stage in, option = " + JSON.stringify(option));
            if (!_isInit) loadAndBuild(stageIn_start);
            else stageIn_start();

            function stageIn_start() {
                _isLocking = true;
                $("#stage_container").append(_dom);
                _p.windowResize();

                _tlStageIn.restart();

                TweenLite.delayedCall(_tlStageIn.duration(), function () {
                    _isLocking = false;
                    if (cb)cb.apply();
                });
            }
        };

        _p.stageOut = function (cb) {
            _isLocking = true;

            var tl = new TimelineLite();
            tl.to(_dom, 1, {alpha: 0});

            TweenLite.delayedCall(tl.duration(), function () {
                _isLocking = false;
                $(_dom).detach();
                if (cb)cb.apply();
            });
        };

        _p.selectOnMenu = selectOnMenu;

        _p.switchBookDialog = switchBookDialog;

        _p.windowResize = windowResize;

        /** private methods **/
        function loadAndBuild(cb) {
            var frames =
                [
                    {url: "_admin_frame.html", startWeight: 0, weight: 100, dom: null}
                ];

            Core.load(null, frames, function loadComplete() {
                build();
                _isInit = true;
                cb.apply();
            }, 0, true);

            function build() {
                _dom = document.createElement("div");
                $("#invisible_container").append(_dom);

                $(_dom).append($(frames[0].dom).children("div"));

                Doms.workArea = Core.extract("#WORK_AREA");
                Doms.panel = Core.extract("#PANEL");
                Doms.menu = Core.extract("#MENU");

                Doms.menuButtons = {};

                Doms.menuButtons.home = Core.extract(".home");
                Doms.menuButtons.collection = Core.extract(".collection");
                Doms.menuButtons.wedding = Core.extract(".wedding");
                Doms.menuButtons.photograph = Core.extract(".photograph");
                Doms.menuButtons.creative = Core.extract(".creative");

                setupBookDialog();

                Panel.init(Doms.panel);

                Doms.bookBlockSample = Core.extract(".book_block", _dom);

                Doms.workArea.innerHTML = "";

                buildTimeline();
                bindFunc();

                if (_dom.parentNode) _dom.parentNode.removeChild(_dom);
            }
        }

        function setupBookDialog()
        {
            Doms.bookDialog = Core.extract(".book_dialog");
            var btnConfirm = Core.extract(".dialog_button_confirm");
            var btnCancel = Core.extract(".dialog_button_cancel");
            var titleTF = Doms.bookDialog.titleTF = Core.extract(".book_title");
            var dateTF = Doms.bookDialog.dateTF = Core.extract(".book_date");
            var descriptionTF = Doms.bookDialog.descriptionTF = Core.extract(".book_description");

            Doms.dateTitleRow = Core.extract(".book_row_3");
            Doms.dateTextRow = Core.extract(".book_row_4");

            titleTF.onkeydown = function(e)
            {
                return !(e.keyCode == 13 && $(this).val().split("\n").length >= $(this).attr('rows'));
            };

            dateTF.onkeydown = function(e)
            {
                return !(e.keyCode == 13 && $(this).val().split("\n").length >= $(this).attr('rows'));
            };




            switchBookDialog(false);

            $(btnConfirm).click(function()
            {
                if(Doms.bookDialog.cbConfirm)
                {
                    Doms.bookDialog.cbConfirm.apply(null, [titleTF.value, dateTF.value, descriptionTF.value]);
                }

                switchBookDialog(false);
            });

            $(btnCancel).click(function()
            {
                if(Doms.bookDialog.cbCancel)
                {
                    Doms.bookDialog.cbCancel.apply(null, []);
                }
                switchBookDialog(false);
            });
        }

        function buildTimeline() {
            var tl = _tlStageIn = new TimelineMax();
            tl.set(_dom, {alpha: 0}, 0);
            tl.to(_dom, .5, {alpha: 1}, 0);

            tl.stop();
        }

        function bindFunc()
        {
            $(Doms.menuButtons.home).click(function()
            {
               Core.toStage("/Home");
                selectOnMenu("home");
            });

            $(Doms.menuButtons.collection).click(function()
            {
                Core.toStage("/Collection");
                selectOnMenu("collection");
            });

            $(Doms.menuButtons.wedding).click(function()
            {
                Core.toStage("/Wedding");
                selectOnMenu("wedding");
            });

            $(Doms.menuButtons.photograph).click(function()
            {
                Core.toStage("/Photograph");
                selectOnMenu("photograph");
            });

            $(Doms.menuButtons.creative).click(function()
            {
                Core.toStage("/Creative");
                selectOnMenu("creative");
            });
        }

        function selectOnMenu(name)
        {
            for(var key in Doms.menuButtons)
            {
                var dom = Doms.menuButtons[key];
                $(dom).toggleClass("selected", false);
            }

            $(Doms.menuButtons[name]).toggleClass("selected", true);
        }

        function switchBookDialog(turnOn, cbConfirm, cbCancel, titleValue, dateValue, descriptionValue, hideDate)
        {
            Doms.bookDialog.cbConfirm = cbConfirm;
            Doms.bookDialog.cbCancel = cbCancel;
            Doms.bookDialog.titleTF.value = titleValue;
            Doms.bookDialog.dateTF.value = dateValue;
            Doms.bookDialog.descriptionTF.value = descriptionValue;

            if(hideDate)
            {
                TweenMax.set(Doms.bookDialog, {marginTop:Doms.bookDialog.init.mt + 100});
                $(Doms.dateTitleRow).css("display", "none");
                $(Doms.dateTextRow).css("display", "none");
            }
            else
            {
                TweenMax.set(Doms.bookDialog, {marginTop:Doms.bookDialog.init.mt});
                $(Doms.dateTitleRow).css("display", "block");
                $(Doms.dateTextRow).css("display", "block");
            }

            if(turnOn)
            {
                $(Doms.bookDialog).css("display", "block");
            }
            else
            {
                $(Doms.bookDialog).css("display", "none");
            }
        }

        /** resize and deform **/
        function windowResize()
        {
            var targetHeight = $(window).height() - Doms.menu.init.h - Doms.panel.init.h - 8;
            $(Doms.workArea).css("height", targetHeight);
        }
    }

}());

(function(){

    var Panel = window.Panel = {};

    var _dom;
    var _buttons = [];

    Panel.init = function(dom)
    {
        _dom = dom;
    };

    Panel.clear = function()
    {
        for(var i=0;i<_buttons.length;i++)
        {
            var dom = _buttons[i];
            $(dom).unbind("click");
        }
        _dom.innerHTML = "";
    };

    Panel.addButton = function(name, cb)
    {
        var dom = document.createElement("div");
        dom.className = "panel_button";
        dom.innerHTML = name;
        $(dom).bind("click", function(event){
            cb.apply(null, [event]);
        });

        _dom.appendChild(dom);
    };

}());

// JavaScript Document
(function ()
{
    "use strict";

    window.Portfolio = new Portfolio();

    function Portfolio()
    {
        var _p = Portfolio.prototype = this;

        _p.stageIn = function (cb, option)
        {
            Panel.clear();
            Panel.addButton("婚禮紀實", function()
            {

            });

            Panel.addButton("專案攝影", function()
            {

            });

            Panel.addButton("影像創作", function()
            {

            });

            if(cb) cb.apply();
        };

        _p.stageOut = function (cb)
        {
            Panel.clear();
            if (cb)cb.apply();
        };

        _p.windowResize = windowResize;

        /** private methods **/

        /** resize and deform **/
        function windowResize()
        {
        }
    }

}());

