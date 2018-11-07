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
          background-color: rgba(200, 200, 200, 0.8);
        }

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
          box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
          z-index: 1;
        }

        .dropdown-content a {
          color: black;
          padding: 12px 16px;
          text-decoration: none;
          display: block;
          text-align: left;
        }

        .dropdown-content a:hover {
          background-color: #ccc
        }

        .dropdown:hover .dropdown-content {
          display: block;
        }

      </style>

      <!-- Javascript modules --->
      <link rel='stylesheet' href='./css/app.css'/>

      <script src="./js/vendor/jquery/dist/jquery.js"></script>
      <script src="./js/vendor/jquery-validation/dist/jquery.validate.js"></script>
      <script src="./js/vendor/lodash/lodash.js"></script>
      <script src="./js/vendor/bootstrap/dist/js/bootstrap.js"></script>
      <script src="./js/vendor/handlebars/dist/handlebars.js"></script>
      <script src="./js/vendor/p5/lib/p5.min.js"></script>
      <script src="./js/vendor/p5/lib/addons/p5.dom.js"></script>

      <script>
          var args = {
              <?php
              if (count($qs) > 1)
                  for ($n = 1; $n < count($qs); $n++) {
                      $arg = explode("=", $qs[$n], 2);
                      echo $arg[0] . ':"' . $arg[1] . '",' . "\n";
                      if ($arg[0] == "online") $onlineflag = 1;
                  };
              ?>
          };
      </script>
      <script src="./config/globe.js"></script>
      <script src="./js/formBuilder.js"></script>
      <script src="./js/esmodule.js"></script>
      <script src="./js/emitter.js"></script>
      <script src="./js/sph-es.js"></script>
      <script src="./sph_plugins/drawLon/index.js"></script>
      <script src="./js/index.js"></script>

      <!--<script src="<?php echo $d ?>/menu.js"></script> -->
      <script>
          function setmenu(menus) {
              menustr = "";
              for (k in menus) {
                  typ = menus[k];
                  v = typ[1];
                  typ = typ[0];
                  switch (typ) {
                      case "home":
                          s = "<a href='<?php echo $url?>' target='pages'>" + k + "</a>\n";
                          break;
                      case "title":
                          s = "<a><b> -- " + k + " -- </b></a>\n";
                          break;
                      case "show":
                          s = "<a href='javascript:sph.show(\"" + v + "\")'>" + k + "</a>\n";
                          break;
                      case "link":
                          if (v.indexOf("/") >= 0) {
                              s = "<a href='" + v + "' target='pages'>" + k + "</a>\n";
                          } else {
                              s = "<a href='<?php echo $d?>/" + v + "' target='pages'>" + k + "</a>\n";
                          }
                          ;
                          break;
                      case "js":
                          s = "<a href='javascript:" + v + "'>" + k + "</a>\n";
                          break;
                      case "raw":
                          s = "<a " + v + ">" + k + "</a>\n";
                          break;
//                      case "esglobe_module":
//                          s = "<a href='javascript:void(0)' onclick=\"var esglobe = new Esglobe(); esglobe.loadModule('" + v + "')\" target='pages'>" + k + "</a>\n";
//                          break;
              case "esglobe_module":
              s = "<a href=\'javascript:parent.loadmod(\"" + v + "\")' target='pages'>" + k + "</a>\n";
                          break;
                  };

                  menustr += s;
              }
              ;
              document.getElementById("menu").innerHTML = menustr;
          }

	  var esglobe;
	  function loadmod(v){
	    esglobe=new Esglobe();
	    esglobe.loadModule(v);
	  }
	  
          function getsph(loc) {
              bn = loc.pathname;
              if (bn.endsWith("/"))
                  sph.baseurl = bn;
              else {
                  i = bn.lastIndexOf('/');
                  sph.baseurl = bn.substr(0, i) + "/";
              }
              ;
              return sph;
          }

          function init() {
              console.log(sph);
//  savedmenu=menu;
//  makemenu(menu);
          }
      </script>

    </head>

<!-- main body -->
    <body onload='init()'>
    <script>
        var sph = window.sph;
        //  sph.baseurl="/esglobe/307/graphics/"
    </script>


    <div class="container-fluid">
      <div id="canvas-container" class="col-xs-7 no-gutter">
        <!--- Widgets Area --->
        <div class="widget top"></div>
        <div class="widget bottom"></div>
      </div>
    </div>


    <img src="cmd2.jpg"
         style='position:absolute;left:1000px;top:10px;width:48px;height:208px'
         usemap='#ctlmap'/>
    <map name='ctlmap'>
      <area shape='rect' coords='0,8,47,39' href='javascript:sph.orient(0,0)'>
      <area shape='rect' coords='0,48,47,79' href='javascript:sph.rot(0.005)'>
      <area shape='rect' coords='0,88,47,119' href='javascript:sph.rot(-0.005)'>
      <area shape='rect' coords='0,128,47,159' href='javascript:sph.pause()'>
      <area shape='rect' coords='0,168,47,199' href='javascript:sph.stop()'>
    </map>

    <div class='rhs'>
      <ul>
        <li class="dropdown" style="float:left">
          <a href="javascript:void(0)" class="dropbtn">MENU</a>
          <div class="dropdown-content" style="left:0">
            <span id='menu'></span>
          </div>
        </li>
      </ul>
      <div id="esglobe-menu-frame">
        <iframe id='ifr' name="pages" src="http:<?php echo $url ?>" height=900px width=800px>
        </iframe>
      </div>
    </div>
    <span id="overlay"><span>
    </body>
</html>
