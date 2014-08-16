<?php

if (!function_exists('json_encode')) {
    function json_encode($content) {
        require_once 'JSON.php';
        $json = new Services_JSON;
        return $json->encode($content);
    }
}


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

function getMaxId($link, $table)
{
    $results = mysql_query('SELECT MAX(id) AS max_id FROM '.$table, $link);
    $var = mysql_fetch_array($results, MYSQL_NUM);

    return $var[0];
}

function addNewRow($link, $table)
{
    mysql_query("INSERT INTO `".$table."`(`id`) VALUES (NULL);", $link);
}

function deleteRow($link, $id, $table)
{
    mysql_query('DELETE FROM `'.$table.'` WHERE id='.$id, $link);
}

function detectCover($link, $book_id)
{
    $query = "SELECT cover_id FROM book_list WHERE id='".$book_id."';";

    $results = mysql_query($query, $link);

    $var = mysql_fetch_array($results, MYSQL_NUM);
    $old_cover_id = $var[0];

    if($old_cover_id == null)
    {
        findCover($link, $book_id);
    }
    else
    {
        $query = "SELECT id FROM book_".$book_id." WHERE id='".$old_cover_id."';";
        $results = mysql_query($query, $link);
        $var = mysql_fetch_array($results, MYSQL_NUM);
        if($var[0])
        {
        }
        else
        {
            findCover($link, $book_id);
        }
    }
}

function findCover($link, $book_id)
{
    $query = "SELECT id FROM book_".$book_id." LIMIT 1;";
    $results = mysql_query($query, $link);

    $var = mysql_fetch_array($results, MYSQL_NUM);
    $new_cover_id = $var[0];

    $query = "UPDATE book_list SET cover_id='".$new_cover_id."' WHERE id='".$book_id."';";
    $success = @mysql_query($query, $link);
}

function updateNumImages($link, $book_id)
{
    $query = "SELECT COUNT(*) as count FROM book_".$book_id.";";
    $results = mysql_query($query, $link);
    $var = mysql_fetch_array($results, MYSQL_ASSOC);
    $num_images = $var['count'];

    mysql_query("UPDATE `book_list` SET num_images='".$num_images."' WHERE id='".$book_id."';", $link);
}