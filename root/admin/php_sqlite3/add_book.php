<?php

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

    $db = new SQLite3('../sqlite3_db.db');


    if($id)
    {
        //$query = "UPDATE book_list SET (".$fieldQuery.") VALUES (".$valueQuery.") WHERE id=".$id.";";
        $query = "UPDATE book_list SET type = '".$type."'";
        $query.=", title = '".$title."'";
        $query.=", date = '".$date."'";
        $query.=", description = '".$description."'";
        $query.=" WHERE id=".$id.";";
        $success = @$db->exec($query);
    }
    else
    {
        $fieldQuery ="'type', 'num_images'";
        $fieldQuery.=", 'title'";
        $fieldQuery.=", 'date'";
        $fieldQuery.=", 'description'";

        $valueQuery = "'".$type."', 0";
        $valueQuery.=", '".$title."'";
        $valueQuery.=", '".$date."'";
        $valueQuery.=", '".$description."'";

        $query = "INSERT INTO book_list(".$fieldQuery.") VALUES (".$valueQuery.");";
        $success = @$db->exec($query);
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
            $results = $db->query('SELECT MAX(id) AS max_id FROM book_list WHERE type="'.$type.'"');
            $id = $response->id = $results->fetchArray()[0];

            $query = "CREATE TABLE 'book_".$id."' ('id'	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT);";
            $success = @$db->exec($query);

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