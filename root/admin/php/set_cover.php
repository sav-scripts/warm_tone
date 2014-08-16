<?php
include "tool.inc";
include "db.inc";

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

    $query = "UPDATE book_list SET cover_id = '".$image_id."' WHERE id='".$book_id."';";

    $success = @mysql_query($query, $link);

    if(!$success)
    {
        $response->res = "fail when updating db";
    }
}

echo json_encode($response);

?>