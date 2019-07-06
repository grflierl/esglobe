<html>
  <?php
     chdir("scripts");
     passthru("./namecountry ".$_SERVER["QUERY_STRING"]);
?>
</html>
