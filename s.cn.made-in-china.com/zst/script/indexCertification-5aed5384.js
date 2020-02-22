/*Source: src/main/webapp/resources/script/showroom2.js*/
/**
 * 该js主要用于展示厅展示页的通用js，装饰页的js请书写在showroom.js中
 * @param obj
 */

var adTabCurNo = 0;// 店招轮播当前页
var adTabTimer;

$(function(){
	
	//临时解决 缩进问号问题
	if($('.custom_richtext').size() > 0){
		var customRichtext = $('.custom_richtext').html().replace(/\?/g,'&nbsp;&nbsp;&nbsp;');
		$('.custom_richtext').html(customRichtext);
	}
	
	
	//天眼查通过js的方式添加链接
	$('.js-tyc').on('click',function(){
		window.open("https://www.tianyancha.com/");
	});
	
	//防爬虫抓取图片信息
	var certImgSrc = $('.js-cert-src').data("obj") || '';
	var certHrefSrc = $('.js-cert-href').data("obj") || '';
	
	$('.js-cert-src').attr('src',certImgSrc.substring(1));
	$('.js-cert-href').attr('href',certHrefSrc.substring(1));
	
	// 防止头部公司描述过长，影响页面展示
	$('.js-header-company-keyword').each(function(){
		var txt = $.trim($(this).text());
		if(txt.length>160){
			$(this).attr('title',txt);
			$(this).text(txt.substring(0,160)+"……");
		}
	});
	//菜单颜色的处理
	$('.prod-lv2 li').on('mouseenter',function(){
		 $(this).parent().prev().css('color','red');
	});
	$('.prod-lv2 li').on('mouseleave',function(){
		 $(this).parent().prev().removeAttr('style');
		 //$(this).parent().prev().css('color','unset');
	});
	//点击+出现更多产品
   $('.js-more-lv2').click(function(){
	  if($(this).html() == '+'){
		   $(this).html('-');
		   $(this).next().next().show();
	   } else{
		   $(this).html('+');
		   $(this).next().next().hide();
	   }
   });
	 //点击+出现更多产品
	   /*$('.js-more-lv2').click(function(){
		  if($(this).html() == '+'){
			   $(this).html('-');
			   $(this).next().next().show();
		   } else{
			   $(this).html('+');
			   $(this).next().next().hide();
		   }
	   });*/

	if(location.href.indexOf('source=sem')!=-1){
		$('.js-comname4seo').css({"font-size":"12px"});
		$('.js-hidden4sem').hide();
		$('.js-contact-qrcode-bd').css({"top":"-301px"});
	}
	$('.js-qrcode-switch-hd,.js-qrcode-switch-bd').mouseenter(function(){
		$('.js-qrcode-switch-bd').show();
		var params = {
			source:'com',
			logUserName:$('#logUserName').val()
		};
		$.get('https://s.cn.made-in-china.com/showroom/ajaxQrCodeStatis.do',params,function(){});
	}).mouseleave(function(e){
		$('.js-qrcode-switch-bd').hide();
	});

	/**产品手机展示厅*/
	$('.js-qrcode-prod-hd,.js-qrcode-prod-bd').mouseenter(function(){
		$(this).parent().addClass('zoom');
		$('.js-qrcode-prod-bd').show();
		var params = {
			source:'prod',
			logUserName:$('#logUserName').val()
		};
		$.get('https://s.cn.made-in-china.com/showroom/ajaxQrCodeStatis.do',params,function(){});
	}).mouseleave(function(e){
		$('.js-qrcode-prod-bd').hide();
		$(this).parent().removeClass('zoom');
	});

	$('.js-contact-qrcode-hd').hover(function(){
		$('.js-contact-qrcode-bd').show();
		$(this).addClass('hover');
		//统计埋点
		var params = {
			source:'contact',
			logUserName:$('#logUserName').val()
		};
		$.get('https://s.cn.made-in-china.com/showroom/ajaxQrCodeStatis.do',params,function(){});
	},function(){
		$('.js-contact-qrcode-bd').hide();
		$(this).removeClass('hover');
	});
	
	//定义 “点击之后在地址栏添加source”的方法 wangmei 2018/7/13
	var addSource = function(val){
		$('.js-url-contact').click(function(e){
			e.preventDefault();
			
			var btnUrl = $(this).attr('href');
			if(btnUrl.indexOf('?')!==-1){
				btnUrl = btnUrl+"&source=" + val;
			}else{
				btnUrl = btnUrl+"?source=" + val;
			}
			
			if($(this).attr('target')==='_blank'){
				window.open(btnUrl);
			}else{
				location.href = btnUrl;
			}
		})
	}
	
	var addNavSource = function(val){
		$('.js-nav-source').click(function(e){
			e.preventDefault();
			
			var btnUrl = $(this).attr('href');
			if(btnUrl.indexOf('?')!==-1){
				btnUrl = btnUrl+"&source=" + val;
			}else{
				btnUrl = btnUrl+"?source=" + val;
			}
			
			if($(this).attr('target')==='_blank'){
				window.open(btnUrl);
			}else{
				location.href = btnUrl;
			}
		})
	}
	
	/*询盘发送 增加追踪码 wangmei 2018/7/13*/
	var url = location.href;
	var reg = /^http(s)?:\/\/[a-zA-Z0-9\-]+.cn.made-in-china.com(\/)?$/;
	
	var sourceParams = [{
		  key:'files',
		  value:'CP02'
	},{
		  key:'contact',
		  value:'CP03'
	},{
		  key:'certificate',
		  value:'CP04'
	},{
		key:'gongying',
		  value:'PP01'
	},{
		  key:'https://s.cn.made-in-china.com/zst/script/prodList.do',
		  value:'PP03'
	}]

	if(reg.test(url)){
		var val = 'CP01';
		addSource(val)
	}

	for(var i=0;i<sourceParams.length;i++){
		var param = sourceParams[i];
		if(url.indexOf(param.key) >=0){
			addSource(param.value);
		}
	}

	//导航菜单添加追踪码
	if(reg.test(url)){
		addNavSource('navHome')
	}

	var sourceNavParams = [{
		key: 'product-list',
		value: 'navProduct'
	},{
		key: 'files',
		value: 'navFiles'
	},{
		key: 'certificate',
		value: 'navCert'
	},{
		key: 'photo',
		value: 'navPhotoList'
	},{
		key: 'video',
		value: 'navVideoList'
	},{
		key: 'gif',
		value: 'navGifList'
	},{
		key: 'companyinfo',
		value: 'navCompany'
	},{
		key: 'contact',
		value: 'navContact'
	}]
	
	for(var j=0;j<sourceNavParams.length;j++){
		var param = sourceNavParams[j];
		if(url.indexOf(param.key) >=0){
			addNavSource(param.value);
		}
	}
	
	//导航菜单悬浮顶部效果；
	$(window).scroll(function(){
		var sT = $(window).scrollTop();
		if(sT > 222 ){
			$('.js-nav').addClass('nav-fixed');
		}else{
			$('.js-nav').removeClass('nav-fixed');
		}
	});

	//菜单下拉
	$('.nav-prod').hover(function () {
		$(this).addClass("nav-prod-hover");
		$(".sub-nav",this).show();
	}, function () {
		$(this).removeClass("nav-prod-hover");
		$(".sub-nav",this).hide();
	});

	if($('.js-companyInf').height()<150){
		$('.js-company-blk-more').hide();
	}

	$('.js-company-blk-more').click(function(){
		$('.js-company-blk-info').height("auto");
		$('.js-company-blk-up').show();
		$('.js-company-blk-more').hide();

	});

	$('.js-company-blk-up').click(function(){
		$('.js-company-blk-info').height("155");
		$('.js-company-blk-more').show();
		$('.js-company-blk-up').hide();

	});

    if ($('#centerBanner img').length > 1) {
        adTabSwitcher();
        adTabActive();
    }

    $("a[names='proPhoto']").each(function(){
		$(this).encryptGroupReload({
			groupId:$(this).attr("groupId"),
			comId:$(this).attr("comId"),
			prodId:$(this).attr("prodId"),
			imgUrl:$('input[name="sourceUrl"]').val()+"images/lock.jpg",
		    domain:$('input[name="sourceUrl"]').val()
		});
	});
	$("#encrypt_group").each(function(){
		$(this).encryptGroup({
			groupId:$("#encrypt_group").attr("groupId"),
			comId:$("#encrypt_group").attr("comId"),
			jumpUrl:$("#encrypt_group").attr("url"),
		    domain:$('input[name="sourceUrl"]').val()
		});
	});

	$(".js-proname").each(function(){
		var n=$(this).text();
		if(n.length>22){
	       var m=n.substr(0,21);
	       $(this).text(m+"...")
		}
	});

	$(".js-heights").each(function(){
      var jsheight=$(this).height();
      var jswidth=$(this).width();
      if(jsheight>jswidth&&jsheight>60){
    	  $(this).height(60);
      }
      if(jswidth>jsheight&&jswidth>60){
    	  $(this).width(60);
      }
      if(jswidth==jsheight){
    	  $(this).width(60);
    	  $(this).height(60);
      }
	});
});


/**
 * 店招换页处理
 */
var adTabSwitcher = function() {
    var tabLi = null;
    var tabImg = null;
    tabLi = $('#banNums li');
    tabImg = $('#centerBanner img');
    if (adTabCurNo >= tabLi.length) {
        adTabCurNo = 0;
    }
    tabImg.css("display", "none").eq(adTabCurNo).css("display", "");
    tabLi.removeClass("now").eq(adTabCurNo).addClass("now");
    adTabInterval();
};

/**
 * 设置间隔时间
 * 每个广告轮播时间间隔是3秒
 */
var adTabInterval = function() {
    clearTimeout(adTabTimer);
    adTabTimer = setTimeout(function() {
        adTabCurNo += 1;
        adTabSwitcher();
    }, 3000);
};

/**
 * 店招轮播触发圆点切换
 */
var adTabActive=function(){
    var tabLi = $('#banNums li');
    var tabImg = $('#centerBanner img');
    var tabWrap = $('#centerBanner').parent();
    tabWrap.hover(function(){
        clearTimeout(adTabTimer);
    },function(){
        adTabSwitcher();
    });
    tabLi.click(function(){
        adTabCurNo=$(this).index();
        tabImg.css("display", "none").eq(adTabCurNo).css("display", "");
        tabLi.removeClass("now").eq(adTabCurNo).addClass("now");
    });
};

function showHide(obj) {
    var $obj = $('#' + obj);
    var className = (function() {
        if ($obj.attr('class') == 'coll') {
            return 'box';
        }
        else {
            return 'coll';
        }
    })();
    $obj.removeClass().addClass(className);
    $('.groupListMore').find('a').toggleClass("showroom-more");
    if( $.trim($('.groupListMore').find('a').html())==='更多'){
    	$('.groupListMore').find('a').html('收起');
    }else{
    	$('.groupListMore').find('a').html('更多');
    }
}

function addFavoriteCompany() {
    var home_site = $('#two_company').val() + " - 我的展示厅";
    var url_site = $('#two_home').val();
    try {
        if (navigator.userAgent.toLowerCase().indexOf("msie") != -1) {
            window.external.AddFavorite(url_site, home_site);
        }
        else {
            window.sidebar.addPanel(home_site, url_site, '');
        }
    }
    catch (e) {
        alert("Sorry! Please Press [Ctrl + D].");
    }
}

$(document).click(function(e) {
    e = window.event || e;
    var el = e.srcElement || e.target;
    if (!($(el).is('#adderr') || $(el).is('#addok') || $(el).parents('#adderr').length > 0 || $(el).parents('#addok').length > 0)) {
        closeInquriyPop("adderr");
        closeInquriyPop("addok");
    }
});
function closeInquriyPop(id) {

    $('#' + id).hide();
	$(".contactFr").css('z-index','0');
	if(id==='js-addok'){
		$('#' + id).popHide();
	}

}
function add2Basket() {

    var SourceId = $('#SourceId').val();
    var SourceType = $('#SourceType').val();
    var userName = $('#remoatUserName').val();

    jQuery.ajax({
        url: '/showroom/ajaxAdd2basket.do?sourceId=' + SourceId + '&sourceType=' + SourceType + '&userName=' + userName,
        type: 'post',
        dataType: 'json',
        contentType: 'applitcation/json',
        async: false,
        success: function(data) {

            if (data.inquiryNum >= 0) {
                //修改页头数字
                $('#inquiry_number_span').html('<font color="red">' + data.inquiryNum + '</font>');
            }

            if (data.ret == '1') {
                if (SourceType == 'com') {
                    $('#inquirytitle').html('公司已成功添加到询盘篮！');
                    $('#inquirycontent').html('您的询盘篮中共有<b class="red2">' + data.comNum + '</b>家公司');
                }
                else if (SourceType == 'prod') {
                    $('#inquirytitle').html('产品已成功添加到询盘篮！');
                    $('#inquirycontent').html('您的询盘篮中共有<b class="red2">' + data.comNum + '</b>家公司的<b class="red2">' + data.prodNum + '</b>个产品');
                }
                else if (SourceType == 'offer') {
                    $('#inquirytitle').html('商情已成功添加到询盘篮！');
                    $('#inquirycontent').html('您的询盘篮中共有<b class="red2">' + data.comNum + '</b>家公司的<b class="red2">' + data.offerNum + '</b>个商情');
                }
                $('#addok').show();
				//添加成功，修改按钮样式
				 var host = document.location.protocol + '//' + document.location.host;
				 var index = host.indexOf("big5");
				if (index > 0) {
					$('#link-add2Basket').replaceWith('<a href="https://big5.made-in-china.com/inquiry-basket/" target="_blank"><img border="0" src="../../resources/images/already_in_basket_cn.gif"/*tpa=https://s.cn.made-in-china.com/resources/images/already_in_basket_cn.gif*/ alt="已加入询盘篮"/></a>');
				}
				else {
					if(SourceType == 'com'){
						$('#link-add2Basket').replaceWith('<a href="https://cn.made-in-china.com/inquiry-basket/#xunpangongsi" target="_blank"><img border="0" src="../../resources/images/already_in_basket_cn.gif"/*tpa=https://s.cn.made-in-china.com/resources/images/already_in_basket_cn.gif*/ alt="已加入询盘篮"/></a>');

					}else{
						$('#link-add2Basket').replaceWith('<a href="https://cn.made-in-china.com/inquiry-basket/" target="_blank"><img border="0" src="../../resources/images/already_in_basket_cn.gif"/*tpa=https://s.cn.made-in-china.com/resources/images/already_in_basket_cn.gif*/ alt="已加入询盘篮"/></a>');

					}
				   }

				$(".contactFr").css('z-index','100');
                $('#adderr').hide();
                setTimeout(function() {
                	$('#addok').hide();
					$(".contactFr").css('z-index','0');
                }, 5000);
            }
            else if (data.ret == '2') {
                $('#maxCount').html(data.inquiryNum);
                $('#adderr').show();
				$(".contactFr").css('z-index','100');
                $('#addok').hide();
                setTimeout(function() {
                	$('#adderr').hide();
					$(".contactFr").css('z-index','0');
                }, 5000);
            }
        },
        error: function() {
            //			alert("添加询盘异常，请稍候在试！");
        }
    });

}
function add2BasketList(obj,SourceId,userName) {
    jQuery.ajax({
        url: '/showroom/ajaxAdd2basket.do?sourceId=' + SourceId + '&sourceType=prod&userName=' + userName,
        type: 'post',
        dataType: 'json',
        contentType: 'applitcation/json',
        async: false,
        success: function(data) {
            if (data.inquiryNum >= 0) {
                //修改页头数字
                $('#inquiry_number_span').html('<font color="red">' + data.inquiryNum + '</font>');
            }
            if (data.ret == '1') {
                $('#inquirytitle').html('产品已成功添加到询盘篮！');
                $('#inquirycontent').html('您的询盘篮中共有<b class="red2">' + data.comNum + '</b>家公司的<b class="red2">' + data.prodNum + '</b>个产品');

                $('.js-addok').pop();
                //添加成功，修改按钮样式
                var host = document.location.protocol + '//' + document.location.host;
                var index = host.indexOf("big5");
                if (index > 0) {
                    $(obj).replaceWith('<a href="https://big5.made-in-china.com/inquiry-basket/" target="_blank" class="inquiry-ope">已加入询盘篮</a>');
                }
                else {
                    $(obj).replaceWith('<a href="https://cn.made-in-china.com/inquiry-basket/" target="_blank" class="inquiry-ope">已加入询盘篮</a>');
                }
                setTimeout(function() {
                    $('.js-addok').popHide();
                }, 5000);
            }
            else if (data.ret == '2') {
                $('#maxCount').html(data.inquiryNum);
                $('.js-adderr').pop();
                setTimeout(function() {
                    $('.js-adderr').popHide();
                }, 5000);
            }
        }
    });
}
function add2fav() {
    var logon = document.detailForm1.logon.value;
    if (logon == '1') {
        document.detailForm1.successPage.value = encodeURI(window.location.href);
        if ($('#curr_action').length > 0) {
            if ($('#curr_action').val() == 'notice') {
                var host = document.location.protocol + '//' + document.location.host;
                document.detailForm1.successPage.value = host;
            }
        }
        document.detailForm1.submit();
    }
    else {
        var currUrl = encodeURI(window.location.href);
        var SourceType = document.detailForm1.SourceType.value;
        var SourceId = document.detailForm1.SourceId.value;
        var sourceOfferType;
        if (document.detailForm1.sourceOfferType) {
            sourceOfferType = document.detailForm1.sourceOfferType.value;
        }
        var vodomain = document.detailForm1.vodomain.value;
        var host = document.location.protocol + '//' + document.location.host;
        var nextpage = host + '/showroom/add2fav.do?SourceType=' + SourceType + '&SourceId=' + SourceId;
        if (document.detailForm1.userName) {
            var userName = document.detailForm1.userName.value;
            nextpage = nextpage + '&userName=' + userName
        }
        if (sourceOfferType) {
            nextpage = nextpage + '&sourceOfferType=' + sourceOfferType
        }
        nextpage = nextpage + '&successPage=';
        document.detailForm1.successPage.value = currUrl;
        document.detailForm1.nextPage.value = nextpage;
        document.detailForm1.submit();
    }

}


/**
 * 改变产品展台
 * @param {Object} node
 */
function changeExhibit(node) {
    var parentNode = $(node).parent();
    parentNode.children().each(function() {
        $(this).attr('class', '');
        var rel = $(this).attr('rel');
        $("ul[rel='" + rel + "']").hide();
    });
    $(node).attr('class', 'now');
    $("ul[rel='" + $(node).attr('rel') + "']").show();
}

/**
 * 通过标签改变展台
 * @param {Object} flag 0 向前 1 向后
 */
function changeExhibitByTag(tag, flag) {
    var parentNode = $(tag).parent();
    var currNode = parentNode.find("span[class='now']");
    if (flag == '0') {
        if (currNode.prev().prev().length != 0) {
            changeExhibit(currNode.prev());
        }
    }
    else {
        if (currNode.next().next().length != 0) {
            changeExhibit(currNode.next());
        }
    }
}


