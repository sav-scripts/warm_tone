<?php

$book_id = @$_POST["book_id"];
$image_id = @$_POST["image_id"];

$response = new stdClass();
$response->res = "ok";

if(!$book_id || !$image_id)
{
    $response->res = "wrong params";
}
else
{
    $db = new SQLite3('../sqlite3_db.db');

    $query = "UPDATE book_list SET cover_id = '".$image_id."' WHERE id='".$book_id."';";

    $success = @$db->exec($query);

    if(!$success)
    {
        $response->res = "fail when updating db";
    }
}

echo json_encode($response);

?>