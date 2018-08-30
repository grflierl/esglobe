<?php
$url=substr($_SERVER["PATH_INFO"],1);
if(strrpos($url,".mp4")>0){
  header("Content-type: video/mp4");
} else {
  header("Content-type: image/jpg");
};
$qs=$_SERVER["QUERY_STRING"];
$cmd="curl ".$url;
if(strlen($qs)>0){
  $cmd=$cmd."?".$qs;
};
//echo $cmd,"\n";
//file_put_contents("/tmp/php.dat",$cmd);
passthru($cmd);
?>
