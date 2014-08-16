<?php

$table = @$_POST["table"];

$db = new SQLite3('../sqlite3_db.db');

$results = $db->query('SELECT * FROM '.$table);
$response = new stdClass();
$array = array();
while ($row = $results->fetchArray(MYSQLI_ASSOC)) {
    //var_dump($row);
    //echo $row[0];
    //echo count($row);
    //array_push($array, $row[0]);
    array_push($array, $row);
    //echo json_encode($row[0]);

}

$response->table = $table;
$response->images = $array;

echo json_encode($response);
//echo $response;
?>