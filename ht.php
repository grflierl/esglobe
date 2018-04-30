<?php
header("Content-type: image/jpg");
$qs=$_SERVER["QUERY_STRING"];
$cmd="curl ".substr($_SERVER["PATH_INFO"],1);
if(strlen($qs)>0){
  $cmd=$cmd."?".$qs;
};
//echo $cmd,"\n";
//file_put_contents("/tmp/php.dat",$cmd);
passthru($cmd);
?>
