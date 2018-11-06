<?php
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_POST['action'];

    if ($method === 'POST') {
        if ($action === 'section') {
            // process globe
            error_log("==inside post===");
            error_log(print_r($_POST, true));

            $timeInput = $_POST['time'];
            $fieldInput = $_POST['field'];
            $contour = $_POST['contour'];
            $min = $_POST['min'];
            $max = $_POST['max'];
            $logscale = $_POST['logScale'];
            $saveData = $_POST['saveData'];
            $lon = $_POST['lon'];
            $depthRegion = $_POST['depthRegion'];
            $fn="es".md5($timeInput.$fieldInput.$min.$max.$contour.$logscale.$lon.$action.$depthRegion);
            $time = array("Jan"=>0,"Feb"=>1,"Mar"=>2,"Apr"=>3,"May"=>4,"Jun"=>5,"Jul"=>6,"Aug"=>7,"Sep"=>8,"Oct"=>9,"Nov"=>10,"Dec"=>11,"Movie"=>-1,"Year"=>-2);

            $t0 = $time[$_POST['time']];
            if ($t0 >= 0)
                $filename=$fn."-".$t0.".png";
            else
                $filename=$fn."-0.png";

            error_log("checking file exists: ../data/output/$filename");

            if (!file_exists("../data/output/$filename") || $saveData) {
                $cmd = "python ../scripts/python/ocean_section.py --filename $fn --field $fieldInput --time $timeInput --logscale $logscale --lon $lon";
                $cmd .= " --contour $contour";
                $cmd .= " --min $min";
                $cmd .= " --max $max";
                $cmd .= " --depth-region $depthRegion";

                if ($saveData) {
                    $cmd .= " --save-data";
                }

                error_log($cmd);
                exec($cmd);
            }

            echo json_encode(array(
                "filename" => $filename,
                "base_filename" => $fn,
                "form" => "section",
                "lat" => $_POST['lat'],
                "lon" => $_POST['lon'],
                "time" => $_POST['time']
            ));
        } else {
            // process globe
            error_log("==inside post===");
            error_log(print_r($_POST, true));

            $timeInput = $_POST['time'];
            $fieldInput = $_POST['field'];
            $depthInput = $_POST['depth'];
            $contour = $_POST['contour'];
            $min = $_POST['min'];
            $max = $_POST['max'];
            $contourStep = $_POST['contourStep'];
            $saveData = $_POST['saveData'];
            $fn="es".md5($timeInput.$fieldInput.$depthInput.$min.$max.$contourStep);
            $time = array("Jan"=>0,"Feb"=>1,"Mar"=>2,"Apr"=>3,"May"=>4,"Jun"=>5,"Jul"=>6,"Aug"=>7,"Sep"=>8,"Oct"=>9,"Nov"=>10,"Dec"=>11,"Movie"=>-1,"Year"=>-2);

            $t0 = $time[$_POST['time']];
            if ($t0 >= 0)
                $filename=$fn."-".$t0.".png";
            else
                $filename=$fn."-0.png";

            error_log("checking file exists: ../data/output/$filename");

            if (!file_exists("../data/output/$filename") || $saveData) {
                error_log("==== executing program ====");
                $cmd = "python ../scripts/python/ocean.py --filename $fn --field $fieldInput --time $timeInput --depth $depthInput";
                if ($contourStep) {
                    $cmd .= " --contour true --contour-step $contourStep";
                }

                $cmd .= " --min $min";
                $cmd .= " --max $max";

                if ($saveData) {
                    $cmd .= " --save-data";
                }

                error_log($cmd);
                exec($cmd);
            }

            echo json_encode(array(
                "filename" => $filename,
                "base_filename" => $fn,
                "colorbarFilename" => $fn."-colorbar.png",
                "form" => "ocean",
                "lat" => $_POST['lat'],
                "lon" => $_POST['lon'],
                "time" => $_POST['time']
            ));
        }


    }
?>