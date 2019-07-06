<?php
// s0.php/script?arguments [; separator]
header("Content-type: text/plain");

//print_r($_SERVER);

$qs=explode(';',$_SERVER['QUERY_STRING']);
$pi=explode("/",$_SERVER['PATH_INFO']);
$script=array_pop($pi);
$pi=implode("/",$pi);
$dir=str_replace("/s0.php","",$_SERVER['DOCUMENT_ROOT']) . "/esglobe" . $pi;
//. "/scripts";

chdir($dir);
//echo $dir,"\n";
$cmd="./".$script.' '.implode(" ",$qs);
//echo $cmd,"\n";
//file_put_contents("/tmp/x","dir=".$dir."  cmd=".$cmd);
passthru($cmd);
?>
