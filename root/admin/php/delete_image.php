<?php

include "tool.inc";
include "db.inc";

$response = new stdClass();
$response->res = "ok";

$table = @$_POST["table"];
$id_list = @$_POST["id_list"];
$book_id = @$_POST["book_id"];

if($id_list && $table)
{
    foreach($id_list as $id)
    {
        deleteRow($link, $id, $table);

        $tempName = '../uploads/'.$table.'/image_'.$id.'.jpg';
        @unlink($tempName);
        $tempName = '../uploads/'.$table.'/thumb_'.$id.'.jpg';
        @unlink($tempName);
    }

    if($book_id)
    {
        detectCover($link, $book_id);
        updateNumImages($link, $book_id);
    }
}
else
{
    $response->res = "wrong params";
}

echo json_encode($response);


?>