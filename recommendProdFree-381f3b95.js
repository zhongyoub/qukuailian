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
			 //����Ʒֻ��һ�����򡰻�һ�������ɵ��,�����Ʒ��������һ��
			 if(typeof($recmdProdList) !="undefined"  && null!=$recmdProdList && $recmdProdList.size()>8){
			 	var currentMaxShowIndex=$("#recmdProdList").find("li:visible:last").index();
                 for(var i=0;i<$recmdProdList.size();i++){
				 	//ѭ�������һ������ӵ�һ�����¿�ʼ��ʾ
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
