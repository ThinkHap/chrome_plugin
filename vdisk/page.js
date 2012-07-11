chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
	console.log(333);
    if (request.qs){
		//获取页面中所有的文件名字和相应的id
		var fileList = {}, url,fileName;
		$('#index_sort_list tr').each(function(index,el){
			$.ajax({
				url: '/share/?fid='+el.id.replace('fid_','')+'&way=json&down=1&rand='+Math.random(),
				success : function( data ){	
					url =  eval("("+data+")")['s3_url'];
					fileName =  eval("("+data+")")['name'];
					fileList[index] = fileName+"~&~"+url;
					if($('#index_sort_list tr').length-1 == index){
						console.log(fileList[index]);
						sendResponse({'fileList': fileList});
					}
				},
				error:function(){vdisk.public.tips('timeout');}
			});
		});
		console.log(fileList);
	}else{
        sendResponse({}); // snub them.
	}
	
});