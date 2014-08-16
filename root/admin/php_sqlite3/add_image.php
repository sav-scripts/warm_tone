<?php

//echo $_POST['image'];
//exit();

ini_set('post_max_size', '8M');
ini_set('upload_max_filesize', '2M');
ini_set('memory_limit', '128M');

include "db_tool.inc";

$response = new stdClass();
$response->res = "ok";

$table = @$_POST['table'];
$image = @$_POST['image'];
$id = @$_POST['id'];
$book_id = @$_POST['book_id'];
$title = @$_POST['title'];
$description = @$_POST['description'];

$tWidth = @$_POST['thumb_width'];
$tHeight = @$_POST['thumb_height'];

if(!$tWidth) $tWidth = 100;
if(!$tHeight) $tHeight = 100;


if($table) $db = new SQLite3('../sqlite3_db.db');

if($id && ($title || $description))
{
    $query = "UPDATE ".$table." SET title = '".$title."', description = '".$description."'";
    $query.=" WHERE id=".$id.";";

    //exit("query = ".$query);

    if(!@$db->exec($query))
    {
        $response->res = "fail when updating title and description";

        exit(json_encode($response));
    }
}

if($image && $table)
{
    if(!$id)
    {
        addNewRow($db, $table);
        $id = getMaxId($db, $table);

        if($book_id)
        {
            detectCover($db, $book_id);
            updateNumImages($db, $book_id);
        }
    }

    $imageData = base64_decode($image);

    $source = imagecreatefromstring($imageData);
    $width = imagesx($source);
    $height = imagesy($source);

    /*
    if($width > $height)
    {
        $srcWidth = $height;
        $srcHeight = $height;
    }
    else
    {
        $srcWidth = $width;
        $srcHeight = $width;
    }
    */

    if($width/$height > $tWidth/$tHeight)
    {
        $srcHeight = $height;
        $srcWidth = $height * $tWidth/$tHeight;
    }
    else
    {
        $srcWidth = $width;
        $srcHeight = $width * $tHeight/$tWidth;
    }

    $dstX = 0;
    $dstY = 0;
    $srcX = ($width - $srcWidth) * .5;
    $srcY = ($height - $srcHeight) * .5;

    $response->srcWidth = $srcWidth;
    $response->srcHeight = $srcHeight;

    $im2 = imagecreatetruecolor($tWidth,$tHeight);

    imagecopyresampled($im2, $source, $dstX,$dstY,$srcX,$srcY, $tWidth,$tHeight, $srcWidth, $srcHeight);
    imagejpeg($im2,"../uploads/".$table."/thumb_".$id.".jpg",100);

    imagejpeg($source, "../uploads/".$table."/image_".$id.".jpg",100);


    $response->id = $id;
}
else if($id && ($title || $description))
{
}
else if(!$image)
{
    $response->res = "wrong image";
}
else if(!$table)
{
    $response->res = "wrong table";
}

echo json_encode($response);
?>