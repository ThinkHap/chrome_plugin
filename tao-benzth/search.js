var searches=[];

function getItemid(link) {
	var ret;
	if (ret=/item\.html?\?(?:.*?=.*?&)*?id=(\d+)/.exec(link))return ret[1];
	if (ret=/[?&]mallstItemId=(\d+)/.exec(link))return ret[1];
	return null;
}

var taobaosearch={
	match:/^http:\/\/s\.taobao\.com/,
	getItems:function(){
		var as=document.querySelectorAll('.list-item h3 a')||[];
		var items=[];
		var id;
		for(var i=as.length-1; i>=0; i--){
			id=getItemid(as[i].href);
			if(id){
				items.push(id);
			}
		}
		return items;
	}
};
searches.push(taobaosearch);

var tmallsearch={
	match:/^http:\/\/list\.tmall\.com/,
	getItems:function(){
		var as=document.querySelectorAll('.product h3 a')||[];
		var items=[];
		var id;
		for(var i=as.length-1; i>=0; i--){
			id=getItemid(as[i].href);
			if(id){
				items.push(id);
			}
		}
		return items;
	}
};
searches.push(tmallsearch);

var allsearch={
	match:/^http:/,
	getItems:function(){
		var as=document.links;
		var id;
		var items=[];
		for(var i=as.length-1; i>=0; i--){
			id=getItemid(as[i].href);
			if(id&&(items.indexOf(id)==-1)){
				items.push(id);
			}
		}
		if(items.length<9){
			return null;
		}
		return items;
	}
};
searches.push(allsearch);

function reportItems(){
	var search=null;
	var url=window.location.href;
	var items=null;
	if(!url)return;
	for(var i=0,l=searches.length; i<l; i++){
		search=searches[i];
		if(search.match.test(url)){
			items=search.getItems();
			if(items&&items.length){
				chrome.extension.sendRequest({qfsearch:true,url:url,items:items});
				return;
			}
		}
	}
}
reportItems();

