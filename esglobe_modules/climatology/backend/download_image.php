<?php

    $fileName = $_GET['filename'];
    $filePath = '../data/output/' . $fileName;
    header('Content-Type: application/json');
    if (file_exists($filePath)) {
        error_log("FILEPATH EXISTS");
        $image = imagecreatefrompng($filePath);
        $bg = imagecreatetruecolor(imagesx($image), imagesy($image));
        imagefill($bg, 0, 0, imagecolorallocate($bg, 255, 255, 255));
        imagealphablending($bg, TRUE);
        imagecopy($bg, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));
        imagedestroy($image);
        $quality = 90; // 0 = worst / smaller file, 100 = better / bigger file
        imagejpeg($bg, $filePath . ".jpg", $quality);
        imagedestroy($bg);


        if (file_exists($filePath . ".jpg")) {
            header('Content-Description: File Transfer');
            header('Content-Type: image/jpeg');
            header('Content-Disposition: attachment; filename="'.basename($fileName . ".jpg").'"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($filePath . ".jpg"));
            readfile($filePath . ".jpg");
            exit;
        }



    } else {
        echo json_encode('{ error: "Invalid file path" }');
    }

?>