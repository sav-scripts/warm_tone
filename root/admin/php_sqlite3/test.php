<?php

include "db_tool.inc";

$book_id = @$_GET['book_id'];

$db = new SQLite3('../sqlite3_db.db');

updateNumImages($db, $book_id);

//detectCover($db, $book_id);


/* test
$type = "wedding";
$db = new SQLite3('../sqlite3_db.db');



$results = $db->query('SELECT MAX(id) AS max_id FROM book_list WHERE type="'.$type.'"');

echo $results->fetchArray()[0];
*/
?>