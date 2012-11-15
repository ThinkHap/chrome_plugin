//条目展示模板
var itemTemplate=document.getElementById("item-template").innerHTML;
//最后展示条目，供item.html使用
var latestItem=null;
//当前展示的有佣金的条目列表
var items=[];
//默认弹出提示时间
var defaultTime=8;
//所有查询过佣金的条目
var itemsMap={};
//查询过的条目记录，对象为{url:"",items:[]}的形式
var searchItems=[];
//一次请求的最大数量，目前淘宝给的应该是20条记录
var MAX_SIZE=40;
//程序版本
var VERSION="1.2.0";
/**
 * 购买此商品，打开用户的购买链接
 */
function buyItem(id){
    //huntxhunt 淘宝客PID：mm_25587274_0_0
	getUserItemLink(id,function(url){
		//var url = url.replace('25857323', '25587274');
		window.open(url);
	});
}
/**
 * 获取用户的商品链接,一次尽可能查询多条
 */
function getUserItemLink(id,callback){
	var nick=getUser();
	var item=itemsMap[id];
	if(nick=='huntxhunt'){    //设置默认淘宝客USER
		callback(item['click_url']);
		return;
	}
	var nick_url=nick+'__url';
	if(item[nick_url]){
		callback(item[nick_url]);
		return;
	}
	var ids=id+',';
	var idscount=1;
	for(var i=0,len=items.length; idscount<MAX_SIZE&&i<len; i++){
		if((!items[i][nick_url])&&(id!=items[i].num_iid)){
			ids+=items[i].num_iid+',';
			idscount++;
		}
	}
	ids=ids.substring(0,ids.length-1);
	var url='http://taohunt.sinaapp.com/itemconvert.php?id='+ids+'&nick='+nick+'&v='+VERSION;
	var jqxhr = $.getJSON(encodeURI(url), function(data) {
        data = data.taobaoke_items_convert_response.taobaoke_items.taobaoke_item
		if(!(data&&data.length))return;
		var theidurl=null;//用户请求id对应的url
		for(var i=0,len=data.length; i<len; i++){
			var one=data[i];
			itemsMap[one.num_iid][nick_url]=one['click_url'];
			if(id==one.num_iid){
				theidurl=one['click_url'];
			}
		}
		if(theidurl){
			callback(theidurl);
		}
	});
}
/**
 * 获取淘宝用户信息，回调callback
 */
function getTaobaoUser(nick, callback){
	try{
		var query='http://taohunt.sinaapp.com/userget.php?nick='+nick+'&v='+VERSION;
		$.getJSON(encodeURI(query),function(data){
			callback(data);
		});
	}catch(e){
		callback(null);
	}
}
/**
 * 是否已经包含item了
 * 
 * @param item
 * @returns
 */
function containsItem(item){
	for(var i in items){
		i=items[i];
		if(i.num_iid==item.num_iid)return true;
	}
	return false;
}
/**
 * 提示该商品
 * 
 * @param item
 * @returns
 */
function tip(item) {
	if (item == null||!item.num_iid){return;}
	latestItem=item;
	if(!containsItem(item)){
		items.push(item);
		chrome.browserAction.setBadgeText({text:''+items.length});
	}
	// 弹出提示的时间长
	var time=localStorage['poptime'];
	if(time==null||time==''){
		time=this.defaultTime;
	}else{
		time=parseInt(time);
		if(time||time===0){}else{
			time=this.defaultTime;
		}
	}
	if(time===0)return;
	var notification = webkitNotifications.createHTMLNotification('item.html');
	notification.show();
	setTimeout(function(){notification.cancel();},time*1000); 
}
/**
 * 通过网页地址获取商品id
 * 
 * @param link
 * @returns
 */
function getItemid(link) {
	var ret;
	if (ret=/item\.html?\?(?:.*?=.*?&)*?id=(\d+)/.exec(link))return ret[1];
	if (ret=/[?&]mallstItemId=(\d+)/.exec(link))return ret[1];
	if (ret=/spu-(\d+).html?/.exec(link))return ret[1];
	if (ret=/spu-.*?-(\d+)---.html?\?/.exec(link))return ret[1];
	return null;
}
/**
 * 获取当前设定的账号
 * 
 * @returns
 */
function getUser(){
	return localStorage['useaccount']||'huntxhunt';  //设置默认淘宝客user
}
/**
 * 访问商品信息网页
 * @param id
 */
function visitItem(id, referrer){
	if(!id)return;
	var tempItem=itemsMap[id];
	if(tempItem){
		tip(tempItem);
	}else{
		var items=findItemsInSearch(id);
		if(items){
			//将id移动到第一位
			var new_items=[id];
			for(var i=0,l=items.length; i<l; i++){
				if(items[i]!=id){
					new_items.push(items[i]);
				}
			}
			items=new_items;
		}else{
			items=[id];
		}
		var url='http://taohunt.sinaapp.com/itemconvert.php?id='+items.join(',')+'&v='+VERSION+'&referrer="'+referrer+'"';
		var jqxhr = $.getJSON(encodeURI(url), function(data) {
            data = data.taobaoke_items_convert_response.taobaoke_items.taobaoke_item
			var result = (data&&data.length)?data:[];
			for(var i=0,l=result.length; i<l; i++){
				var one=result[i];
				itemsMap[one.num_iid]=one;
			}
			if(!itemsMap[id]){
				itemsMap[id]={};
			}
			tip(itemsMap[id]);
		});
	}
}
/**
 * 通过一个商品的id反向查找它属于的组，没有找到的话返回null,找到返回id的数组
 * 但是数组长度不能超过MAX_SIZE,这里的处理办法是分别向前，向后找。
 */
function findItemsInSearch(id){
	var items=null;
	var index=-1;
	for(var i=searchItems.length-1; i>=0; i--){
		items=searchItems[i].items;
		if((index=items.indexOf(id))>=0){
			if(items.length<=MAX_SIZE)return items;
			if(items.length-1<=index+(MAX_SIZE/2-1)){
				return items.slice(items.length-MAX_SIZE,items.length);
			}else if(0>=index-(MAX_SIZE/2-1)){
				return items.slice(0,MAX_SIZE);
			}else{
				return items.slice(index-(MAX_SIZE/2-1),index-(MAX_SIZE/2-1)+MAX_SIZE);
			}
		}
	}
	return null;
}
/**
 * 记录搜索结果
 */
function recordSearch(url,items){
	for(var i=searchItems.length-1; i>=0; i--){
		if(searchItems[i].url==url)return;
	}
	if(searchItems.length>80){//太多了则删除开始的一部分
		searchItems.splice(0,10);
	}
	searchItems.push({url:url,items:items});
}
/**
 * 接收到新的浏览请求
 * @param request
 * @param sender
 * @param callback
 */
function onRequest(request, sender, callback) {
	if (request.qftaobaoke) {
		var link=request.link;
		var itemId=getItemid(link);
		var referrer=request.referrer;
		if(!itemId)return;
		visitItem(itemId, referrer);
	}else if(request.qfsearch){
		recordSearch(request.url,request.items);
	}
};
chrome.extension.onRequest.addListener(onRequest);
