<style>
ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #444;
}

li {
    float: left;
}

li a, .dropbtn {
    display: inline-block;
    color: white;
    text-align: center;
    padding: 14px 16px;
    text-decoration: none;
}

li a:hover, .dropdown:hover .dropbtn {
    background-color: #777;
}

li.dropdown {
    display: inline-block;
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: #eee;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
}

.dropdown-content a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    text-align: left;
}

.dropdown-content a:hover {background-color: #ccc}

.dropdown:hover .dropdown-content {
    display: block;
}

img{
  padding: 0px;
  border:0px;
  margin: 0px;
  width: 32px;
  height: 20px;
}
</style>
<ul>
<li class="dropdown" style="float:right">
<a href="javascript:void(0)" class="dropbtn">Menu</a>
<div class="dropdown-content" style="right:0">
<?php
$m=json_decode(file_get_contents($d."/menu.json"),TRUE);
//print_r($m);
foreach($m as $k => $v){
//  echo $k," => ",$v[0]," = ",$v[1],"\n";
switch($v[0]){
  case "home":
    echo "<a href='".$url."' target='pages'>".$k."</a>\n";
    break;
  case "title":
    echo "<a><b> -- ".$k." -- </b></a>\n";
    break;
  case "show":
    echo "<a href='javascript:sph.show(\"".$v[1]."\")'>".$k."</a>\n";
    break;
  case "link":
    if(strpos($v[1],"/")===0){
      echo "<a href='".$v[1]."' target='pages'>".$k."</a>\n";
    } else {
      echo "<a href='".$d."/".$v[1]."' target='pages'>".$k."</a>\n";
    };
    break;
  case "js":
    echo "<a href='javascript:".$v[1]."'>".$k."</a>\n";
    break;
  case "raw":
    echo "<a href='".$v[1]."'>".$k."</a>\n";
    break;
  };
};
?>
</div>
</li>
<li><a href='javascript:sph.orient(0,0)'>Recenter</a></li>
<li><a href='javascript:sph.rot(0.005)'><img src='ccw2.png'/></a></li>
<li><a href='javascript:sph.rot(-0.005)'><img src='cw2.png'/></a></li>
<li><a href='javascript:sph.pause()'>Pause/resume</a></li>
<li><a href='javascript:sph.stop()'>Stop movie</a></li>
</ul>
