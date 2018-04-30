<?php
header("Content-type: image/jpeg");
$qs=explode(",",$_SERVER["QUERY_STRING"]);
//print_r($qs);
$cmd="python gm-esg.py gm-".$qs[0].".csv ".$qs[1]." ".$qs[2];
//echo getcwd(),"\n";
exec($cmd);
//echo $cmd,"\n";
passthru("cat /tmp/gm.jpg");
?>
