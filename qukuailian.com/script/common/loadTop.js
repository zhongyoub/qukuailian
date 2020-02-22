/**
 * @author qiumingsheng
 * 引入top.vm
 */
(function($){
	$(function(){
		var domain = document.location.protocol + '//' + document.location.host;
		var topType = "";
		domain = document.location.host==="https://cn.made-in-china.com/script/common/cn.made-in-china.com"?domain:domain+'/to_oldcn';
		var page = "";
	    if(location.host==="https://cn.made-in-china.com/script/common/yiyao.cn.made-in-china.com"){
	    	page = "yiyao";
	    }
	    if(location.host==="https://cn.made-in-china.com/script/common/jixie.cn.made-in-china.com"){
	    	page = "jixie";
	    }
	    // market判断来自与qp词新页面  医药特殊无channel 属性 单独处理   其他行业属性用channel去判断
	    if(location.search.indexOf("xcase=market") !== -1 || location.pathname.split("/")[1] == "market" 
	    	|| !!$("#channel").val() || (!!$("#action").val() && location.host==="https://cn.made-in-china.com/script/common/yiyao.cn.made-in-china.com")){
	    	topType = "wide";
	    } 
		var topUrl = domain+"/partialComponent/top/?page=" + page + "&topType=" + topType;
		
		$('#top_area').load(topUrl,function(){
			setTimeout(function(){
				$('#miccn_top').show();
				$('#top_area').css('overflow','visible');
			},200);
		});

		function needSideBar(){
			var reg = /\/\/cn.made-in-china.com\/mic_request/;
			return !reg.test(location.href);
		}
		function getEncoding(app){
			//判断编码
			return ((app==="zhanshiting"&&location.href.indexOf('https://cn.made-in-china.com/script/common/.cn.made-in-china.com')===-1)||app==="oldCn"||app==="channel")?"utf":"gbk";
		}
		var wxImgUrls = {
			"caigou": document.location.protocol + "//cn.made-in-china.com/images/common/qcode_abiz.png",
		}

		// 百销通推广套餐不需要足迹
		var href = location.href;
		if(needSideBar()) {
			$('body').append('<div id="sidebar_area"></div>');
			var app = $('input[name="jsAppName"]').val();
			var msgSource = app;
			var wxImgUrl = wxImgUrls[app];
			if(app==="zhanshiting"&&location.href.indexOf("/gongying/")!==-1){
				msgSource = "prod";
			}
			
			var sidebarUrl = domain + "/script/common/miccn.sidebar-"+getEncoding(app)+".js?t="+new Date().getTime();
			$.getScript(sidebarUrl,function(){
				var getUrl = domain+"/partialComponent/sidebar/?xcase="+app+"&t="+new Date().getTime();
				var currentUser = null;
				if(app==="zhanshiting"){
					var $ele = $('#hidden_remote_user_info');
					currentUser = {
						name:$ele.data("name"),
						gender:$ele.data("gender"),
						tel:$ele.data("tel"),
						mobile:$ele.data("mobile"),
						comId:$ele.data("comid"),
						comName:$ele.data("comname"),
						logUsername:$ele.data("logusername"),
						csLevel:$ele.data("cslevel")
					};
					var domainUserId = currentUser.comId+"_00";
					getUrl = getUrl +"&logUsername="+currentUser.logUsername+"&domainUserId="+domainUserId+"&domain=miccn";
					if(location.href.indexOf('/gongying/')!==-1){
						var prodId = location.pathname.slice(-17,-5);
						getUrl = getUrl + "&prodId="+prodId;
					}
				}
				$('#sidebar_area').load(getUrl,function(){
					var sidebar=new SideBar();
					if(app==="zhanshiting"){
						sidebar.init({
							msgSource:msgSource,
							model:"zhanshiting",
							currentUser:currentUser
						});
					}else{
						sidebar.init({
							wxImgUrl:wxImgUrl
						});
					}
				});
				
			});
		}
	});
})(jQuery);