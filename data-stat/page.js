var S = KISSY, D = S.DOM, E = S.Event;

//function checkDataStat() {
    var count = right = error = 0;
    var stat;
    //var result = S.one('#J_Result'); 
    S.all('a').each(function(e){
        stat = D.attr(e, 'data-stat') || '';
        //console.log(stat);
        if(stat){
            right += 1;
        }else {
            error += 1;
            //D.css(e, {'position':'relative', 'color': 'rgba(0,0,0,0.5)', 'box-shadow': '#f44 0 0 3px 5px', 'background-color': 'rgba(0,0,0,0.4)'});
            D.css(e, {'color': 'rgba(0,0,0,0.5)', 'box-shadow': '#f44 0 0 3px 5px', 'background-color': 'rgba(0,0,0,0.4)'});
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
        'count': count,
        'right':right,
        'error':error
    }, function(response) {

});

