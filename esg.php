<html>
  <!-- Javascript modules --->
<script src="p5.min.js"></script>
<script src="p5.dom.min.js"></script>
<script>
var args={
  sz:950,
  w:450,
scalefac:1.06,
<?php
   $f=$_SERVER['QUERY_STRING'];
   if(strlen($f)>0) echo 'map:"'.$f.'.jpg"',"\n";
?>
};
</script>
<script src="sph-es.js"></script>
<script>
parent.sph = sph;
</script>
</head>

<!-- main body -->
<body>
<!--<center>Drag sphere to change viewpoint</center>-->
<?php include($f.".html")?>
</body>
</html>
