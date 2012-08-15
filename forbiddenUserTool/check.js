var S = KISSY, D = S.DOM, E = S.Event;
var check = S.one('#J_Check');


function forbiddenUser(){
    chrome.tabs.executeScript(null, {file : "page.js"});
    //chrome.tabs.insertCSS(null, {file: "page.css"})
}
forbiddenUser();

//chrome.extension.onRequest.addListener(function(request, sender, sendResponse) { 
//    iniStat(request);
//});

