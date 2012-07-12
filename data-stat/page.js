var S = KISSY, D = S.DOM, E = S.Event;

//function checkDataStat() {
    var count = right = error = 0;
    var stat;
    var pvstat;

    if(S.one('#J_PvStat')){
        pvstat = S.one('#J_PvStat').attr('data-stat');
    }

    S.all('a').each(function(e){
        stat = D.attr(e, 'data-stat') || '';
        //console.log(stat);
        if(stat){
            right += 1;
            if(right === 1){
                (function (d) {
                    var ta=d.createElement("script");ta.type="text/javascript";ta.async=true;
                    ta.innerText="function ajaxSend(objectOfXMLHttpRequest, callback) {  if(!callback){  return;  };  var s_ajaxListener = new Object();  s_ajaxListener.tempOpen = objectOfXMLHttpRequest.prototype.open;  s_ajaxListener.tempSend = objectOfXMLHttpRequest.prototype.send;  s_ajaxListener.callback = function () {  callback(this.method, this.url, this.data);  };  objectOfXMLHttpRequest.prototype.open = function(a,b) {  if (!a){ var a=''};  if (!b){ var b=''};  s_ajaxListener.tempOpen.apply(this, arguments);  s_ajaxListener.method = a;    s_ajaxListener.url = b;  if (a.toLowerCase() == 'get') {  s_ajaxListener.data = b.split('?');  s_ajaxListener.data = s_ajaxListener.data[1];  }  };  objectOfXMLHttpRequest.prototype.send = function(a,b) {  if (!a) var a='';  if (!b) var b='';  s_ajaxListener.tempSend.apply(this, arguments);  if(s_ajaxListener.method.toLowerCase() == 'post') {  s_ajaxListener.data = a;  }  s_ajaxListener.callback();  }  }; function onAjaxSend(method, url, data) {  alert('onAjaxSend'); console.log(method); console.log(url); console.log(data); } ajaxSend(this.XMLHttpRequest, onAjaxSend); var target_arr = document.getElementsByTagName('a'); var flag = 1; if(target_arr.length){ for(var i = 0; i < target_arr.length; i++){ var stat = target_arr[i].getAttribute('data-stat'); if(stat && flag){ evt=document.createEvent('MouseEvents'); evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null); evt.preventDefault(); target_arr[i].dispatchEvent(evt); flag = 0; } } }";
                    d.getElementsByTagName("body")[0].appendChild(ta);
                })(document);
            }
            D.attr(e, 'title', stat);
            D.css(e, {'color': 'rgba(0,0,0,0.5)', 'box-shadow': 'rgba(63,175,250,1) 0 0 3px 5px', 'background-color': 'rgba(24,151,236,0.4)'});
        }else {
            error += 1;
            D.attr(e, 'title', 'no data-stat');
            D.css(e, {'color': 'rgba(0,0,0,0.5)', 'box-shadow': '#f44 0 0 3px 5px', 'background-color': 'rgba(252,52,52,0.4)'});
            if(D.css(e, 'position') != 'absolute') {
                D.css(e, {'position':'relative'});
            }
            D.attr(e, 'edata-no', error);
            var text = D.html(e);
            if(!text){
                D.text(e, '@');
            }
        }
        count += 1;
    });
    
    //localStorage.setItem('count', count);
    //localStorage.setItem('right', right);
    //localStorage.setItem('error', error);
    //var resultHtml = D.create('<div id="result">count: '+count+'; right: '+right+'; error: '+error+'</div>');
    //D.prepend(resultHtml, document.body);
//}


chrome.extension.sendRequest({
        'pvstat': pvstat,
        'count': count,
        'right':right,
        'error':error
    }, function(response) {

});

