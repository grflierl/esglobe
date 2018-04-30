<!doctype html>
<?php
$qs=explode(";",$_SERVER["QUERY_STRING"]);
   $url=$qs[0];
   $onlineflag=0;
   if(strpos($url,".html")>0 || strpos($url,".php")>0){
   $d=implode("/",explode("/",$url,-1));
   if(strlen($d)==0)$d=".";
   } else {
     $d=$url;
   }
//   echo "---",$d,"---\n";
?>
<html >
    <head>
    <style>
body {
    background-image: url("stars.jpg");
    background-repeat: no-repeat;
    }
div.rhs {
    position: absolute;
    top: 0px;
    left: 1050px;
    border: 0px;
    background-color: rgba(200,200,200,0.8);
}
</style>

<!-- Javascript modules --->
<script src="p5.min.js"></script>
<script src="p5.dom.min.js"></script>
<script>
var args={
  sz:950,
  w:450,
  scalefac:1.06,
  <?php
  if(count($qs) > 1)
  for ($n=1;$n<count($qs);$n++){
      $arg=explode("=",$qs[$n],2);
      echo $arg[0] . ':"' . $arg[1] . '",' ."\n";
      if($arg[0]=="online")$onlineflag=1;
  };
  ?>
};

function getsph(loc){
  bn=loc.pathname;
  if(bn.endsWith("/"))
    sph.baseurl=bn+"graphics/";
  else {
    i=bn.lastIndexOf('/');
    sph.baseurl=bn.substr(0,i)+"/graphics/";
  };
  return sph;
  }

function init(){
    console.log(sph);
}
</script>

//<script src="sph-es.js"></script>
</head>

<!-- main body -->
<body onload='init()'>
<script src="sph-es.js"></script>
<script>
  var sph = window.sph;
//  sph.baseurl="/esglobe/307/graphics/"
</script>
<div class='rhs'>
  <?php require("menu.php") ?>
<iframe id='ifr' name="pages" src="http:<?php echo $url?>" height=900px width=800px>
</iframe>
</div>
<span id="overlay"><span>
</body>
</html>
