<?php

$type = @$_POST["type"];
$fields = @$_POST["fields"];
$ignore_empty = @$_POST["ignore_empty"];

if(!$fields) $fields = "id,title,date,description,num_images,cover_id,type";

$response = new stdClass();
$response->res = "ok";


$db = new SQLite3('../sqlite3_db.db');
$query = 'SELECT '.$fields.' FROM book_list';
if($type) $query.=' WHERE type="'.$type.'"';
if($type && $ignore_empty) $query.= ' and num_images > 0';
else if($ignore_empty) $query.= ' WHERE num_images > 0';

$query.=' ORDER BY id DESC;';

//echo $query;

$results = $db->query($query);
$array = array();
while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
    array_push($array, $row);
}

$response->book_list = $array;

echo json_encode($response);

?>