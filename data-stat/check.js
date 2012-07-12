var S = KISSY, D = S.DOM, E = S.Event;
var check = S.one('#J_Check');


E.on('#J_Check', 'click', function(e){
    chrome.tabs.executeScript(null, {file : "page.js"});
    chrome.tabs.insertCSS(null, {file: "page.css"})
    e.preventDefault();
})

E.on('#J_Clear', 'click', function(e){
    S.one('#J_Result').css({'display':'none'});
    localStorage.removeItem('count');
    localStorage.removeItem('right');
    localStorage.removeItem('error');
    localStorage.removeItem('pvstat');
    chrome.browserAction.setBadgeText({text:''})
})


function iniStat(request) {
    var result = S.one('#J_Result'); 
    if(request){
        var pvstat = request.pvstat;
        if(!pvstat){
            pvstat = '空';
        }
        var count = request.count;
        var right = request.right;
        var error = request.error;
        D.text('#J_Result strong', count);
        D.text('#J_Result .right', right);
        D.text('#J_Result .error', error);
        D.text('#J_Result .pvstat', pvstat);
        result.css({'display': 'block'});
        localStorage.setItem('count', count);
        localStorage.setItem('right', right);
        localStorage.setItem('error', error);
        localStorage.setItem('pvstat', pvstat);
        chrome.browserAction.setBadgeText({text: ''+error})
    }else if (localStorage.getItem('count')){
        D.text('#J_Result strong', localStorage.getItem('count'));
        D.text('#J_Result .right', localStorage.getItem('right'));
        D.text('#J_Result .error', localStorage.getItem('error'));
        D.text('#J_Result .pvstat', localStorage.getItem('pvstat'));
        result.css({'display': 'block'});
    }
}
iniStat();

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) { 
    iniStat(request);
});

