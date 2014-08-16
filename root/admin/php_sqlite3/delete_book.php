<?php

$id = @$_POST["id"];
$type = @$_POST["type"];

$response = new stdClass();
$response->res = "ok";

if($id && $type)
{
    $db = new SQLite3('../sqlite3_db.db');

    $success = @$db->exec("DELETE FROM book_list WHERE id=".$id.";");

    if($success)
    {
        $success = @$db->exec("DROP TABLE 'book_".$id."';");

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

function delete_directory($dirname) {
    $dir_handle = null;
    if (is_dir($dirname))
        $dir_handle = opendir($dirname);
    if (!$dir_handle)
        return false;
    while($file = readdir($dir_handle)) {
        if ($file != "." && $file != "..") {
            if (!is_dir($dirname."/".$file))
            {
                unlink($dirname."/".$file);
            }
            else
                delete_directory($dirname.'/'.$file);
        }
    }
    closedir($dir_handle);
    rmdir($dirname);
    return true;
}