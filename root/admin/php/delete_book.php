<?php

include "tool.inc";
include "db.inc";

$id = @$_POST["id"];
$type = @$_POST["type"];

$response = new stdClass();
$response->res = "ok";

if($id && $type)
{
    $success = @mysql_query("DELETE FROM book_list WHERE id=".$id.";", $link);

    if($success)
    {
        $success = @mysql_query("DROP TABLE book_".$id.";", $link);

        if($success)
        {
            $success = delete_directory("../uploads/book_".$id."/");
            if(!$success)
            {
                $response->res = "fail when deleting directory";
            }
        }
        else
        {
            $response->res = "fail when deleting book table";
        }
    }
    else
    {
        $response->res = "fail when deleting db";
    }
}
else
{
    $response->res = "wrong params";
}

echo json_encode($response);