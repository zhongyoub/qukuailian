/**
 * @author qiumingsheng
 * ����ͳһ��¼ע�ᵯ����
 * window.logonType-��¼�����Ϊ
 * tm: ��ͨ��¼
 * refresh��ˢ�µ�ǰҳ��
 * redirect���ض���
 * submit���ύָ���ı�-$(this).data('formid')
 * contactinfo: ������ϵ����Ϣ
 * update,���������¶�������¼״̬
 *
 *
 */
$(function($) {
	var sourceUrl = '';
	
	$('body').delegate('.js-popLogon','click',function(){
		window.logonType = $(this).data('type');
		window.submitFormId = $(this).data("formid");
		window.comIdentity = $(this).data("identity");
		var callback = function(){
			$.micpop({
	              'popId': 'popLogReg',
	              'maskId': 'showdiv',
	              'closeId': 'pop-logon-frame-close',
	              'callback': function() {
	                  $('.showTipStyle').hide();
	                  setComIdentity();
	              }
	          });
    	};
    	popLogon(callback);

   });
	$('body').delegate('.js-formPopLogon','click',function(){
		window.logonType = $(this).data('type');
		window.submitFormId = $(this).data("formid");
		window.comIdentity = $(this).data("identity");
		var callback = function(){
			$.micpop({
	              'popId': 'popLogReg',
	              'maskId': 'showdiv',
	              'closeId': 'pop-logon-frame-close',
	              'callback': function() {
	                  $('.showTipStyle').hide();
	                  setComIdentity();
	              }
	          });
    	};
    	popLogon(callback);

   });
    $('#popJoinM').click(function() {
    	window.logonType = $(this).data('type');
		window.submitFormId = $(this).data("formid");
		window.comIdentity = $(this).data("identity");
    	popLogon(function(){
    		$.micpop({
	            'popId': 'popLogReg',
	            'maskId': 'showdiv',
	            'closeId': 'pop-logon-frame-close',
	            'callback': function() {
	    			var $tmLoginTab = $('#tmLoginTab').find('li');
	    			$tmLoginTab.removeClass('on');
	    			$tmLoginTab.eq(1).addClass('on');
    				$('#tmLogonPopCont').hide();
    				$('#tmJoinPopCont').show();
	                $('.showTipStyle').hide();
	                setComIdentity();
	            }
	        });
    	});
    });

    $('#reportLogReg, #reportLogRegB').click(function() {
    	window.logonType = $(this).data('type');
		window.submitFormId = $(this).data("formid");
		window.comIdentity = $(this).data("identity");
    	popLogon(function(){
    		$('#baseNextPage').val($('#reportNextPage').val());
	        $.micpop({
	            'popId': 'popLogReg',
	            'maskId': 'showdiv',
	            'closeId': 'pop-logon-frame-close',
	            'callback': function() {
	                $('.showTipStyle').hide();
	                setComIdentity();
	            }
	        });
    	});
    });
    
    $('.js-pop-logon-btn').click(function() {
    	window.logonType = $(this).data('type');
		window.submitFormId = $(this).data("formid");
		window.comIdentity = $(this).data("identity");
		window.baseNextPage = $(this).data("baseNextPage");
		if(window.logonType==="link"){
			window.targetType = $(this).data("targetType");
		}
    	popLogon(function(){
    		if(window.baseNextPage){
    			$('#baseNextPage').val(window.baseNextPage);
    		}
	        $.micpop({
	            'popId': 'popLogReg',
	            'maskId': 'showdiv',
	            'closeId': 'pop-logon-frame-close',
	            'callback': function() {
	                $('.showTipStyle').hide();
	                setComIdentity();
	            }
	        });
    	});
    });
    
    $('#commentLogReg, #commentLogRegB').click(function() {
    	window.logonType = "refresh";
    	window.comIdentity = $(this).data("identity");
    	popLogon(function(){
    		$('#baseNextPage').val($('#commentNextPage').val());
	        $.micpop({
	            'popId': 'popLogReg',
	            'maskId': 'showdiv',
	            'closeId': 'pop-logon-frame-close',
	            'callback': function() {
	                $('.showTipStyle').hide();
	                setComIdentity();
	            }
	        });
    	});
    });
    
    jQuery('body').delegate('img[name="tmLogo"],a[name="tmLogo"],span[name="tmLogo"]', 'click', function(e) {
    	var source = $(this).data('source');
    	var comId = $(this).data('comid')||"";
    	var prodId = $(this).data('prodid')||"";
    	var url = '/to_vo/static/bi/?type=tm&source='+source;
    	var tmUrl = $(this).data('url');
    	
    	//����ǲ�Ʒ����ҳ���url����ȡ��Ʒid
    	if(location.href.indexOf('/gongying/')!==-1){
			prodId = location.pathname.slice(-17,-5);
		}
    	
    	if(comId){
			// �����Ӧ�̲������ҿ���������ת�ӿͷ����ܣ�����Ҫ��¼ֱ�Ӵ����߿ͷ�ҳ��
			getSupplierStatus(comId,function(data){
				if(data.code==1 && data.data.isSupplyOnline=="false" && data.data.enableTurnToService=="true"){
					var targetUrl = data.data.ocsUrl;
					var tempComId = comId.indexOf("_")===-1?comId:comId.split('_')[0];
					var extenalParam = "comId="+tempComId+"&prodId="+prodId;
					var params = targetUrl.split('referrer');
					targetUrl = params[0] + extenalParam ;
					if(params.length>1){
						targetUrl = targetUrl + "&referrer" + params[1] ;
					}
					chatWithSupplier(url, targetUrl);
				}else{
					chatWithSupplier(url, tmUrl);
				}
			});
		}else{
			chatWithSupplier(url, tmUrl);
		}
    	
    });
    
    function chatWithSupplier(url,tmUrl){
    	if (jQuery('#join_now_span:visible').length > 0) {
    		var encodeTmUrl = encodeURIComponent(tmUrl);
    		$.get(url+'&logonstatus=false');
    		window.logonType = "tm";
    		popLogon(function(){
    			$('.js-pop-link').css('display', 'block');
    			$('#baseNextPage').val(tmUrl);
    			$('#popLinkId').attr("href", location.protocol+'//cn.made-in-china.com/partialComponent/tm_visitor_logon/?domainUrl='+ encodeTmUrl);
    	        $.micpop({
    	            'popId': 'popLogReg',
    	            'maskId': 'showdiv',
    	            'closeId': 'pop-logon-frame-close',
    	            'callback': function() {
    	                $('.showTipStyle').hide();
    	                setComIdentity();
    	            }
    	        });
        	});
    	}else{
    		$.get(url+'&logonstatus=true');
			openTmView(tmUrl);
    	}
    }
    
    function openTmView(url){
		top.open(url,"kefu","toolbar=no,location=no,directories=no,resizable=yes,status=yes,menubar=no,scrollbars=yes,width=800,height=600,left=0,top=0");
    }
    
    
});

/**
 * ����Ĭ�ϵĻ�Ա���
 */
function setComIdentity(){
	if(typeof window.comIdentity!=="undefined"&&window.comIdentity===0){
    	setTimeout(function(){
    		$('.js-buyer').trigger("click");
    	},100);
    }
}
function popLogon(callback){
	var domain = document.location.protocol + '//' + document.location.host;
	if(domain.indexOf('zhanhui')===-1){		
		domain = document.location.host==="https://cn.made-in-china.com/js/cn.made-in-china.com"?domain:domain+'/to_oldcn';
	}
	
	if($('#popLogReg').size()===0||$.trim($('#popLogReg').html())===""){
		$('body').append('<div class="pop pop-login" id="popLogReg"></div>');
		if($('#showdiv').size()===0){
    		$('body').append('<div id="showdiv"></div>');
    	}
		jQuery.getScript(document.location.protocol + "//cd.abiz.com/script/sso.js",function(){
	        jQuery.getScript(document.location.protocol + "//membercenter.cn.made-in-china.com/script/sso/ssosubmit.js",function(){
	        	var xcase="";
	        	if($('input[name="js-website"]').size()!==0){
	        		xcase = $('input[name="js-website"]').val();
	        	}else{
	        		if(location.href.indexOf('https://cn.made-in-china.com/js/zhanhui.cn')!==-1){
	        			xcase = "zhanhui";
	        		}
	        	}
                jQuery('#popLogReg').load(domain+'/navigation.do?action=logonAjaxNew&xcase='+xcase+'&t=' + new Date().getTime(), function() {
                    callback();
                });
	        });
	    });
	}else{
		 callback();
	}
}

// �жϹ�Ӧ����ͨ����״̬
function getSupplierStatus(comId,callback){
	$.ajax({
		url:location.protocol+"//webim.trademessenger.com/tmcn/api/supplyInfo.jsonp",
		data:{
			"supplyDomainUserId":comId
		},
		type:"GET",
		dataType:"jsonp",
		jsonpCallback:"successCallback",
		success:function(data){
			callback(data);
		}
	})
}