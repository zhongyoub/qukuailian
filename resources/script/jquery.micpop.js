(function($) {
    $.micpop = function(options) {
        var settings = {
            'popId': 'pop',				//要弹出的页面
            'popClass': '',				//给弹出页面附加的样式
            'popContentId': 'popContent',//
            'popMessage': '',			//message会显示在contentID上
            'maskId': 'popMask',		//弹出层容器
            'maskClass': 'tip-alpha',	//容器的class
            'closeId': '',				//绑定关闭按钮
            'closeCallback': $.noop,    //关闭弹窗回调
            'closeIdSecond': '',		//绑定关闭按钮
            'okId': '',					//绑定ok控件
            'cancelId': '',				//绑定取消控件
            'okCallback': $.noop,		//ok控件的回调函数
            'cancelCallback': $.noop,	//取消时间的回调函数
            'dragId': 'popDrag',        //拖动
            'callback': $.noop,			//回调
            'popType':'pop',
            'beforeOkCallback':function(){
	        	return true;
	        },
            'afterOkClose': true
        };
        $.extend(settings, options);
        new micpop(settings);
    };

    function micpop(settings) {
        this._init(settings);
    }

    $.extend(micpop.prototype, {
        _init: function(options) {
            var _this = this;
			if(options.popType==='preview'){
				 this._showLayerPreview(options);
			}else{
				this._showLayer(options);
			}
            $('#' + options.popId).show();
            this._showMask(options);
            $('#' + options.maskId).show();
            if (options.closeId != "") {
                var $closeObj = $('#' + options.closeId);
                $closeObj.click(function() {
                	options.closeCallback();
                    _this._hidePop(options);
                });
            }
			if (options.closeIdSecond != "") {
                var $closeSecondObj = $('#' + options.closeIdSecond);
                $closeSecondObj.click(function() {
                    _this._hidePop(options);
                });
            }
            if (options.cancelId != "") {
                var $cancelObj = $('#' + options.cancelId);
                $cancelObj.click(function() {
                    options.cancelCallback();
                    _this._hidePop(options);
                    return false;
                });
            }
            if (options.okId != "") {
                var $okObj = $('#' + options.okId);
                $okObj.unbind('click').click(function() {
                	if(options.beforeOkCallback()){
                		options.okCallback();
                        if (options.afterOkClose) {
                            _this._hidePop(options);
                        }
                	}
                    return false;
                });
            }
            $(window).resize(function() {
                _this._showLayer(options);
                _this._showMask(options);
            });
            $(window).scroll(function() {
                _this._showLayer(options);
                _this._showMask(options);
            });
            this._dragAnimate(options);
            options.callback();
        },
        _showLayer: function(options) {
            var $popObj = $('#' + options.popId);
            $popObj.addClass(options.popClass);
            var $popContent = $('#' + options.popContentId);
            $popContent.html(options.popMessage);

            var docEle = document.documentElement || document.body;
            var objLeft = $(window).scrollLeft() + (docEle.clientWidth - $popObj.width()) / 2 + "px";
            var objTop = $(window).scrollTop() + (docEle.clientHeight - $popObj.height()) / 2 + "px";
			if($(window).scrollTop() + (docEle.clientHeight - $popObj.height()) / 2 <=0){
                objTop="100px";
			}
            $popObj.css({
                'left': objLeft,
                'top': objTop,
                'z-index': 1001,
                'position': 'absolute'
            });
        },
		_showLayerPreview: function(options) {
            var $popObj = $('#' + options.popId);
            $popObj.addClass(options.popClass);
            var $popContent = $('#' + options.popContentId);
            $popContent.html(options.popMessage);

            var docEle = document.documentElement || document.body;
            var objLeft = $(window).scrollLeft() + (docEle.clientWidth - $popObj.width()) / 2 + "px";
            var objTop = "300px";
            $popObj.css({
                'left': objLeft,
                'top': objTop,
                'z-index': 1001,
                'position': 'absolute'
            });
        },
        _hidePop: function(options) {
            var $popObj = $('#' + options.popId);
            var $maskObj = $('#' + options.maskId);
            $popObj.hide();
            $maskObj.removeClass(options.maskClass).hide();
        },
        _showMask: function(options) {
            var $maskObj = $('#' + options.maskId);
            $maskObj.addClass(options.maskClass);
            var docEle = document.documentElement || document.body;
            var objWidth = Math.max(docEle.scrollWidth, docEle.offsetWidth, docEle.clientWidth);
            var objHeight = Math.max(docEle.scrollHeight, docEle.offsetHeight, docEle.clientHeight);

            var isIE = $.browser.msie;
            if (isIE) {
                objWidth = objWidth - 5;
                objHeight = objHeight - 5;
            }

            $maskObj.css({
                'width': objWidth,
                'height': objHeight,
                'left': 0,
                'top': 0
            });

            if (isIE && $.browser.version == '6.0') {
                var $iframe = $maskObj.find('iframe');
                if ($iframe.length <= 0) {
                    $maskObj.append('<iframe></iframe>');
                }
                $iframe = $maskObj.find('iframe');
                $iframe.css({
                    'height': objHeight,
                    'width': objWidth
                });
                $iframe.removeClass(options.maskClass).addClass(options.maskClass);
            }
        },
        _dragAnimate: function(options) {
            var $dropObj = $('#' + options.dragId);
            var $popObj = $('#' + options.popId);
            var draging = false;
            var _x = 0, _y = 0;
            var $maskObj = $('#' + options.maskId);
            $dropObj.mousedown(function(e) {
                e = e || window.event;
                if ($.browser.msie ? e.button != '1' : e.button != '0') {
                    return;
                }
                _x = e.pageX - $popObj.offset().left;
                _y = e.pageY - $popObj.offset().top;
                draging = true;

                $(document).mousemove(function(e) {
                    if (!draging) {
                        return;
                    }
                    if (e.pageX - _x > $maskObj.width() - $popObj.width() ||
                    e.pageY - _y > $maskObj.height() - $popObj.height() ||
                    e.pageX - _x < 0 ||
                    e.pageY - _y < 0) {
                        return;
                    }
                    $popObj.css({
                        'left': e.pageX - _x,
                        'top': e.pageY - _y
                    });

                }).mouseup(function() {
                    $(document).unbind('mousemove').unbind('mouseup');
                    draging = false;
                });
            });
        }
    });
})(jQuery);
