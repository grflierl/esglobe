<?php
// s.php/script?#;arguments [; separator]
header("Content-type: text/plain");

$qs=explode(';',$_SERVER['QUERY_STRING']);
//print_r($qs);
$script="/var/www/html".$_SERVER['PATH_INFO'];
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
passthru($cmd);
?>
