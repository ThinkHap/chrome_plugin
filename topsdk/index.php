<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>taohunt</title>
        <style type="text/css">
            body, form, h1, h2, h3, h4, p, img, ul, li, ol, dl, dt, dd, a, span, input, tr, th, td{margin:0;padding:0;}
		    body {font:normal 12px/1.5 "Arial","宋体","Simsun","Tahoma",sans-serif;}
		    li {list-style:none;}
		    img {border:0 none;vertical-align:top;}
		    table {border-collapse:collapse;border-spacing:0;}
            .clear-fix:after {display:block;visibility:hidden;font-size:0;line-height:0;clear:both;content:"";}  
            .clear-fix {zoom:1;}
		    a {color:#000;text-decoration:none;}
		    a:hover {text-decoration:underline;}

            .wrap {
                width: 800px;
                margin: 50px auto;
            } 

            .result {
                margin-top: 10px;
            }
            .result ul {
                width: 400px;
                border: 2px solid #ccc;
                margin: 10px 0;
            }
            .result span,
            .result a {
                font-weight: bold;
            }
        </style>
        <script src="https://s.tbcdn.cn/s/kissy/1.2.0/kissy-min.js"></script>
    </head>
    <body>
        <div id="wrap" class="wrap">
            <div class="info">
                <label for="url">URL</label><input type="text" name="url" value="" id="url">
                <label for="nick">NICK</label><input type="text" name="nick" value="" id="nick">
                <!--<label for="pid">PID</label><input type="text" name="pid" value="" id="pid">-->
                <button id="submit">Get Commission</button>
                <button id="testnick">Test nick</button>
                <span id="testinfo"></span>
            </div>
            <div id="result" class="result">
            </div>
        </div>
        <script>
            var S = KISSY, D = S.DOM, E = S.Event;
            E.on('#submit', 'click', function(ev){
                var url = D.get('#url').value;
                var nick = encodeURI(D.get('#nick').value) || '';

                if(!url){
                    D.html('#testinfo', 'url为空');
                    return;
                }else if(!getItemid(url)){
                    D.html('#testinfo', '请填入正确的URL');
                    return;
                }else {
                    var id = getItemid(url);
                }

                function getItemid(link) {
                	var ret;
                	if (ret=/item\.html?\?(?:.*?=.*?&)*?id=(\d+)/.exec(link)) return ret[1];
                	if (ret=/[?&]mallstItemId=(\d+)/.exec(link)) return ret[1];
                	if (ret=/spu-(\d+).html?/.exec(link)) return ret[1];
                	if (ret=/spu-.*?-(\d+)---.html?\?/.exec(link)) return ret[1];
                	if (ret=/(\d+)/.exec(link)) return ret[1];
                	return null;
                }
                
                S.io.get('itemconvert.php?id=' + id + '&nick=' +nick + '&t=' + S.now(), function(data){
                    data = S.JSON.parse(data);
                    if(data.taobaoke_items_convert_response.total_results > 0){
                        var items = data.taobaoke_items_convert_response.taobaoke_items.taobaoke_item;
                        var _ul = '';
                        if(items.length > 0){
            		        S.each(items,function(item,i){
                                _ul += '<ul>'; 
                                _ul += '<li><a href="'+ item.click_url +'" target="_blank"><image width="200" height="200" src="'+ item.pic_url +'"></a></li>'; 
                                _ul += '<li>num_iid: <span>'+ item.num_iid +'</span></li>'; 
                                _ul += '<li>title: <a href="'+ item.click_url +'" target="_blank"><span>'+ item.title +'</span></a></li>'; 
                                _ul += '<li>price: <span>'+ item.price +'</span></li>'; 
                                _ul += '<li>commission_rate: <span>'+ parseFloat(item.commission_rate)/100 +'%</span></li>'; 
                                _ul += '<li>commission: <span>'+ item.commission +'</span></li>'; 
                                _ul += '<li>commission_num: <span>'+ item.commission_num +'</span></li>'; 
                                _ul += '<li>commission_volume: <span>'+ item.commission_volume +'</span></li>'; 
                                _ul += '<li>URL: <a href="'+ item.click_url +'" target="_blank">click_url</a></li>'; 
                                _ul += '</ul>'; 
                            });
                        }
                        D.html('#result', _ul);
                        
                    }
                });
            });
           
            E.on('#testnick', 'click', function(ev){
                var nick = encodeURI(D.get('#nick').value) || '';
                
                S.io.get('userget.php?nick=' +nick + '&t=' + S.now(), function(data){
                    data = S.JSON.parse(data);
                    try{
                        data = data.user_get_response.user;
                    }catch(e){
                    }
                    if(data.nick){
                        D.html('#testinfo', '账号：'+ decodeURI(nick) + '测试通过')
                    }else{
                        D.html('#testinfo', '账号：'+ decodeURI(nick) + '测试不通过')
                    };
                });
            });
        </script>
    </body>
</html>

