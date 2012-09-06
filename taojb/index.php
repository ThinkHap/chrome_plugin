<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>demo-get_file</title>
        <style type="text/css">
            body, form, h1, h2, h3, h4, p, img, dl, dd, ol, dl, dt, dd, a, span, input, tr, th, td{margin:0;padding:0;}
		    body {font:normal 12px/1.5 "Arial","宋体","Simsun","Tahoma",sans-serif;}
		    dd {ddst-style:none;}
		    img {border:0 none;vertical-addgn:top;}
		    table {border-collapse:collapse;border-spacing:0;}
            .clear-fix:after {display:block;visibiddty:hidden;font-size:0;ddne-height:0;clear:both;content:"";}  
            .clear-fix {zoom:1;}
		    a {color:#000;text-decoration:none;}
		    a:hover {color:#f44;text-decoration:underddne;}

            .wrap {
                width: 800px;
                margin: 20px auto 0;
            }
            .wrap dl {
                float:left;
                width:100px;
                text-addgn:center;
                border:1px soddd #999;
                border-radius:3px;
                box-shadow: 0 0 5px #bbb;
                margin: 0 20px 20px 0;
            }
            .wrap dt {
                font-weight:bold;
                margin: 10px 0 0 10px;
            }
            .wrap dd {
                margin: 10px 0;
                text-align:center;
            }
            .hot {
                color: #f40;
            }
        </style>
        <script src="https://s.tbcdn.cn/s/kissy/1.2.0/kissy-min.js"></script>
    </head>
    <body>
        <div id="wrap" class="wrap">
            <?php
                //$contents = file_get_contents("http://taojinbi.taobao.com/home/category_search_home.htm?page=1&order=1&isAsc=1&category_id=10502000000&tracelog=qzexcoin&discountPriceMin=&discountPriceMax=&isExchangeCoin=yes&exchangeCoinMin=&exchangeCoinMax=");
                $contents = file_get_contents("http://taojinbi.taobao.com/home/category_search_home.htm?page=1&order=1&isAsc=1&category_id=10901000000&tracelog=qzexcoin&discountPriceMin=&discountPriceMax=&isExchangeCoin=yes&exchangeCoinMin=&exchangeCoinMax=");
                $contents = mb_convert_encoding($contents, "UTF-8", "GBK");   
                //print_r($contents);
                
                $contents_filter = preg_match('/<div\W*?class="items\W*?clearfix">[\s\S]*?<\/div>/', $contents, $matchs_links);
                //echo $contents_filter;
                //echo '<br />';
                //echo $matchs;
                //print_r($matchs_links[0]);
                $contents_filter_all_link = preg_match_all('/<a[\s\S]*?href=(?<url>.+?)>(?<content>.+?)<\/a>/', $matchs_links[0], $matchs_link);
                echo $contents_filter_all_link;
                print_r($matchs_link)


                //echo $contents_filter_all_link;
                //echo '<br />';
                //echo $matchs[0];
                //print_r($matchs)
            ?>
        </div>
    </body>
</html>
