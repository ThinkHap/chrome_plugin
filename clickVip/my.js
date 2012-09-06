
Mofang();
function Mofang() 
{ 
	var obj = GetElementsByClassName("btn-start J_CheckLogin","a");
	//var obj = document.getElementById("J_Lucky");
	//if(obj.length==0)
	//{
	//	setTimeout('Close()',3000);
	//	setTimeout('Mofang()',100);
	//}
	triggerClick(obj[0]);
	//dispatch(obj.nextSibling,"mouseHover");
	//triggerClick(obj);
	//obj = obj.nextSibling;
	//alert(obj.currentStyle);
	//triggerClick(obj);
	
	//if(i>20)
	//{
	//	i=0;
	//	setTimeout('Mofang()',100);

	//}
	//else
    setTimeout('Close()', 3000, 'Mofang()');
	//setTimeout(function(){
    //    Close();
    //},5000);	
}
//<div id="J_VolCat" class="vol-cat" style="top: 74px; "></div>
function Close () 
{ 
	var objClose = GetElementsByClassName("btn-ks-close","a");
	if(objClose.length>0)
		triggerClick(objClose[0]);//dispatch(objClose[0], 'href');	
    console.log('close');
    console.log(objClose[0]);
}

/*var script = document.createElement('script');
script.type = 'text/javascript';
script.innerHTML = "show('Lucky')";
//script.innerHTML = "SaveResult(1)";
document.head.appendChild(script);

setTimeout('Lucky()',1000);*/
	
function Lucky()
{
	triggerClick(document.getElementById("ContentPlaceHolder1_Lucky1_Button1"));
	setTimeout('Lucky()',9000);
}	
	
function Delete1()
{

	triggerClick(arrDel1[nIndex*2].childNodes[1].childNodes[0]);
	setTimeout('Delete2()',500);

}
function Delete2()
{
	triggerClick(arrDel2[1]);
	if(nIndex<arrDel1.length)
	{
		nIndex++
		setTimeout('Delete1()',1000);
	}
}


function ClickBox()	
{
	box = document.getElementById("J_msg1");
    links = box.getElementsByTagName('a');
	triggerClick(links[0]);
}
/*var strCount = GetElementsByClassName(" xep xdp","a")[0].childNodes[1].innerText;	//random
var nCount=parseInt(strCount);

for(var i=20;i<nCount-20;i+=20)
{
	setTimeout('SimulateClick()',5000*i/20);
}

setTimeout('GetID()',6000*nCount/20);*/


function koo8()
{
var GM = { "s": "2011-11-11 21:00:00", "e": "2011-11-11 21:02:00", "a": "632", "msg": "", "dir": "", "web": "http://www.coo8.com", "msweb": "http://k.coo8.com", "t": "500", "tp": "1" };
	//show
	var divMath = document.getElementById("divMath");
	divMath.style.display="";
	divMath.innerHTML = "<div class=\"Con For\"><div id='msDiv'></div><img title='&#28857;&#20987;&#26356;&#25442;&#39564;&#35777;&#30721;' alt='&#28857;&#20987;&#26356;&#25442;&#39564;&#35777;&#30721;' onclick=\"this.src='Ajax/RegCode.aspx?s=" + GM.a + "&t='"+Math.random()+"\" style='cursor:hand;border:1px solid #ccc;vertical-align:top;' src=\"Ajax/RegCode.aspx?s=" + GM.a + "&t=" + Math.random() + "\" id='ob_codeimg'><span>&#31572;&#26696;&#65306;<input type='text' name='tval' id='tval' /></span><span><img style='cursor:pointer;' id='imgSb' src=\"/images/Repy.jpg\" /></span><div class=\"clear\"></div></div>";

	//bind
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.innerHTML = "function onImgClick(){ppkCreate('ms' + GM.a + GM.tp, GM.a);submi();}imgSb.onclick=onImgClick;";
	document.head.appendChild(script);
	document.head.removeChild(script);
}

function GetID()
{
	var arrQuestion = GetElementsByClassName("xeq","h2");	//random
	var strQuestion = "";
	for(var i=0;i<arrQuestion.length;i++)
	{
		strQuestion += "," + arrQuestion[i].childNodes[0].href ;
	}
	strQuestion = strQuestion.replace(/http:\/\/www.zhihu.com\/question\//g,"");
	strQuestion = strQuestion.replace(",","");
	strQuestion = strQuestion.replace(/#[0-9]{1,8}/g,"");
	var arrQuestion = strQuestion.split(",");
	arrQuestion.distinct();
	for(var j=0;j<arrQuestion.length;j++)
	{
		document.write(arrQuestion[j]);
		if(j!=arrQuestion.length-1)
			document.write(",");
	}
}

function NullFunc()
{
	alert("waiting");
}

function IsLoadOver()
{
	var strLoadTest=document.getElementById("xbg").innerText;	//random
	if(strLoadTest=="更多")
		return true;
	else
		return false;
}

function GetElementsByClassName (strClassName,strTag) 
{ 
    var aimObj = []; 
    var elements = document.getElementsByTagName(strTag) ;//取得所有元素的集合 
    //alert(elements.length); 
    for(var i=0;i <elements.length;i++) 
    { 
        if(elements[i].className==null) continue; 
        if(elements[i].className == strClassName) 
        { 
            aimObj.push(elements[i]); 
        } 
    } 
    return aimObj;     
} 

function dispatch(el, type){
        try{
            var evt = document.createEvent('Event');
            evt.initEvent(type,true,true);
            el.dispatchEvent(evt);
        }catch(e){alert(e)};
}

function triggerClick(el) {
    evt=document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true);
    //evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    evt.preventDefault();
    el.dispatchEvent(evt);
    //if(el.click) {
    //    el.click();
    //}else{
    //    try{
    //        var evt = document.createEvent('Event');
    //        evt.initEvent('click',true,true);
    //        el.dispatchEvent(evt);
    //    }catch(e){alert(e)};       
    //}
}

Array.prototype.distinct = function(){ 
 var $ = this; 
 var o1 = {}; 
 var o2 = {}; 
 var o3 = []; 
 
 var o; 
 for(var i=0;o = $[i];i++){ 
  if(o in o1){ 
   if(!(o in o2)) o2[o] = o; 
   delete $[i]; 
  }else{ 
   o1[o] = o; 
  } 
 } 
  
 $.length = 0; 
 for(o in o1){ 
  $.push(o); 
 } 
  
 for(o in o2){ 
  o3.push(o); 
 } 
   
 return o3; 
} 
