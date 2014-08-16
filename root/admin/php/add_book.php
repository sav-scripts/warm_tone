<?php

include "tool.inc";
include "db.inc";

$type = @$_POST["type"];
$id = @$_POST["id"];
$title = @$_POST["title"];
$date = @$_POST["date"];
$description = @$_POST["description"];


$response = new stdClass();
$response->res = "ok";

if(!$type)
{
    $response->res = "lack type";
}
else
{
    if($id)
    {
        //$query = "UPDATE book_list SET (".$fieldQuery.") VALUES (".$valueQuery.") WHERE id=".$id.";";
        $query = "UPDATE book_list SET type = '".$type."'";
        $query.=", title = '".$title."'";
        $query.=", date = '".$date."'";
        $query.=", description = '".$description."'";
        $query.=" WHERE id=".$id.";";
        $success = @mysql_query($query, $link);
    }
    else
    {
        $fieldQuery ="`type`, `num_images`";
        $fieldQuery.=", `title`";
        $fieldQuery.=", `date`";
        $fieldQuery.=", `description`";

        $valueQuery = "'".$type."', 0";
        $valueQuery.=", '".$title."'";
        $valueQuery.=", '".$date."'";
        $valueQuery.=", '".$description."'";

        $query = "INSERT INTO `book_list`(".$fieldQuery.") VALUES (".$valueQuery.");";

        //INSERT INTO `vhost17915-1`.`book_list` (`id`, `type`, `title`, `description`, `num_images`, `cover_id`, `date`) VALUES (NULL, 'wedding', '', '', '0', NULL, '');

        $success = @mysql_query($query, $link);
    }

    //echo $query;


    //$results = $db->query("INSERT INTO book_list('type', 'title', 'description', 'num_images') VALUES ('".$type."', '".$title."', '".$description."', 0);");

    if($success == false)
    {
        $response->res = "fail when executing sql";
    }
    else
    {
        if($id)
        {
            $response->id = $id;
        }
        else
        {
            //$results = $db->query('SELECT MAX(id) AS max_id FROM book_list WHERE type="'.$type.'"');
            $results = mysql_query('SELECT MAX(id) AS max_id FROM book_list WHERE type="'.$type.'"', $link);
            $array = mysql_fetch_array($results, MYSQL_NUM);
            $id = $response->id = $array[0];

            $query = "CREATE TABLE book_".$id."(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY);";
            $success = @mysql_query($query, $link);

            $response->query = $query;

            if(!$success)
            {
                $response->res = "fail when creating new table";
            }
            else
            {
                $success = mkdir("../uploads/book_".$id, 0777);
                if(!$success)
                {
                    $response->res = "faile when creating directory";
                }
            }

        }
    }

}

echo json_encode($response);

?>