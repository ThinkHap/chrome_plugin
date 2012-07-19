<?php
header("Content-type: text/html; charset=utf-8");
date_default_timezone_set("PRC");
$appKey = '21060248';
$appSecret = 'f3568960d7f90f6936e977810d299623';
if (!array_key_exists('nick', $_GET)) {
    $nick = 'huntxhunt';
}elseif($_GET[nick] == '') {
    $nick = 'huntxhunt';
}else{
    $nick = $_GET[nick];
}
if (array_key_exists('id', $_GET)) {
    $id = $_GET[id];
}else {
    echo "{'error_response':{'msg':'no id input'}}";
    die;
}

//签名函数
function createSign ($paramArr) {
     global $appSecret;
     $sign = $appSecret;
     ksort($paramArr);
     foreach ($paramArr as $key => $val) {
         if ($key !='' && $val !='') {
             $sign .= $key.$val;
         }
     }
     $sign.=$appSecret;
     $sign = strtoupper(md5($sign));
     return $sign;
}

//组参函数
function createStrParam ($paramArr) {
     $strParam = '';
     foreach ($paramArr as $key => $val) {
     if ($key !='' && $val !='') {
             $strParam .= $key.'='.urlencode($val).'&';
         }
     }
     return $strParam;
}

//参数数组
$paramArr = array(
    'app_key' => $appKey,
    'method' => 'taobao.taobaoke.items.convert',
    'format' => 'json',
    'v' => '2.0',
    'sign_method'=>'md5',
    'timestamp' => date('Y-m-d H:i:s'),
    'fields' => 'title,price,pic_url,click_url,num_iid,commission,commission_rate,commission_num,commission_volume',
    'num_iids' => $id,
    'nick' => $nick 
);
//生成签名
$sign = createSign($paramArr);
//组织参数
$strParam = createStrParam($paramArr);
$strParam .= 'sign='.$sign;
//访问服务
$url = 'http://gw.api.taobao.com/router/rest?'.$strParam;
$result = file_get_contents($url);
//$result = json_decode($result);
//$result = '\['.$result.'\]';
//echo "json的结构为:";
//print_r($result);
//print_r(json_encode($result));
//echo "json_encode($result)";
?>
<?=$result?>

