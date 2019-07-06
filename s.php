<?php
// s.php/script?#;arguments [; separator]
header("Content-type: text/plain");

$qs=explode(';',$_SERVER['QUERY_STRING']);
$pi=explode("/",$_SERVER['PATH_INFO']);
$script=array_pop($pi);
$pi=implode("/",$pi);
$dir=str_replace("/s0.php","",$_SERVER['DOCUMENT_ROOT']) . "/esglobe" . $pi;
//. "/scripts";

$script=$dir . "/" . $script;
$n=$qs[0];
//echo $script,"\n";
if($qs[0]==1){
  unset($qs[0]);
  exec("pkill -f ss.py");
  $cmd="./imgs/ss.py 9393 ".$script.' "'.implode(";",$qs).'"';
//  echo $cmd,"\n";
  exec($cmd." >/dev/null &");
  sleep(2);
};
$cmd="./imgs/sr.py 9393 ".$n;
//echo $cmd,"\n";
file_put_contents("/tmp/x","mov dir=".$dir."  cmd=".$cmd);
passthru($cmd);
?>
