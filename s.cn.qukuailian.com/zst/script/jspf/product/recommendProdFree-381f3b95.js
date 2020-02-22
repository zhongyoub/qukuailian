/*Source: src/main/webapp/resources/script/refreshProd.js*/
$(function(){
	 var $recmdProdList=$("#recmdProdList").find("li");
	 var pinshu=$recmdProdList.size()%8;
	 if(pinshu<3){
		 var sheqi=parseInt($recmdProdList.size()/8);
		 if(sheqi>0){
			 $recmdProdList.eq(sheqi*8).remove();
			 $recmdProdList.eq(sheqi*8+1).remove();
		 }
	 }
	  $("#refreshProd").click(
	  	function(){
			 //若产品只有一屏，则“换一批”不可点击,必须产品数量大于一屏
			 if(typeof($recmdProdList) !="undefined"  && null!=$recmdProdList && $recmdProdList.size()>8){
			 	var currentMaxShowIndex=$("#recmdProdList").find("li:visible:last").index();
                 for(var i=0;i<$recmdProdList.size();i++){
				 	//循环到组后一屏，则从第一屏重新开始显示
				   if(currentMaxShowIndex==$recmdProdList.size()-1){
					   	  if(i==0 || i==1 ||i==2 || i==3|| i==4 || i==5 || i==6 || i==7){
	                        $recmdProdList.eq(i).show();
						  }else{
						  	 $recmdProdList.eq(i).hide();
						  }
				   }else{
				   	   if(i<currentMaxShowIndex){
                         $recmdProdList.eq(i).hide();
				        }else{
						   	if(i==(currentMaxShowIndex+1) || i==(currentMaxShowIndex+2)  || i==(currentMaxShowIndex+3)  || (i==currentMaxShowIndex+4) || (i==currentMaxShowIndex+5) || (i==currentMaxShowIndex+6)|| (i==currentMaxShowIndex+7)|| (i==currentMaxShowIndex+8)){
		                         $recmdProdList.eq(i).show();
							}else{
								 $recmdProdList.eq(i).hide();
							}

				       }
				   }


	          }
		}
	  });
});
