<?php
/**
 * Created by PhpStorm.
 * User: sav
 * Date: 2014/7/21
 * Time: 上午 10:09
 */

class SimpleDB
{
    public $db;

    var $table;

    function SimpleDB($tableName = "home", $dbName = "../sqlite3_db.db")
    {
        $this->table = $tableName;
        $this->db = new SQLite3($dbName);
    }

    function getMaxId()
    {
        $results = $this->db->query('SELECT MAX(id) AS max_id FROM '.$this->table);

        return $results->fetchArray()[0];
    }

    function addNewRow()
    {
        $this->db->query("INSERT INTO ".$this->table."('id') VALUES (NULL);");
    }

    function deleteRod($id)
    {
        $results = $this->db->query('DELETE FROM '.$this->table.' WHERE id='.$id);
    }
}

function getMaxId($db, $table)
{
    $results = $db->query('SELECT MAX(id) AS max_id FROM '.$table);

    return $results->fetchArray()[0];
}

function addNewRow($db, $table)
{
    $db->query("INSERT INTO ".$table."('id') VALUES (NULL);");
}

function deleteRow($db, $id, $table)
{
    $db->query('DELETE FROM '.$table.' WHERE id='.$id);
}

function detectCover($db, $book_id)
{
    $query = "SELECT cover_id FROM book_list WHERE id='".$book_id."';";

    $result = $db->query($query);

    $old_cover_id = $result->fetchArray()[0];

    if($old_cover_id == null)
    {
        findCover($db, $book_id);
    }
    else
    {
        $query = "SELECT id FROM book_".$book_id." WHERE id='".$old_cover_id."';";
        $result = $db->query($query);
        if($result->fetchArray()[0])
        {
        }
        else
        {
            findCover($db, $book_id);
        }
    }
}

function findCover($db, $book_id)
{
    $query = "SELECT id FROM book_".$book_id." LIMIT 1;";
    $result = $db->query($query);

    $new_cover_id = $result->fetchArray()[0];

    $query = "UPDATE book_list SET cover_id='".$new_cover_id."' WHERE id='".$book_id."';";
    $success = @$db->exec($query);
}

function updateNumImages($db, $book_id)
{
    $query = "SELECT COUNT(*) as count FROM book_".$book_id.";";
    $result = $db->query($query);
    $num_images = $result->fetchArray()['count'];

    $db->exec("UPDATE book_list SET num_images='".$num_images."' WHERE id='".$book_id."';");
}