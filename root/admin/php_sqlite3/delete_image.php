<?php

include "db_tool.inc";

$response = new stdClass();
$response->res = "ok";

$table = @$_POST["table"];
$id_list = @$_POST["id_list"];
$book_id = @$_POST["book_id"];

if($id_list && $table)
{
    $db = new SimpleDB($table);

    foreach($id_list as $id)
    {
        $db->deleteRod($id);

        $tempName = '../uploads/'.$table.'/image_'.$id.'.jpg';
        @unlink($tempName);
        $tempName = '../uploads/'.$table.'/thumb_'.$id.'.jpg';
        @unlink($tempName);
    }

    if($book_id)
    {
        detectCover($db->db, $book_id);
        updateNumImages($db->db, $book_id);
    }
}
else
{
    $response->res = "wrong params";
}

echo json_encode($response);


?>