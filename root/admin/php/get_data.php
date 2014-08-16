<?php
include "tool.inc";
include "db.inc";

$table = @$_POST["table"];


$results = mysql_query('SELECT * FROM '.$table, $link);
$response = new stdClass();
$array = array();
while ($row = mysql_fetch_object($results)) {
    array_push($array, $row);
}

$response->table = $table;
$response->images = $array;

echo json_encode($response);
//echo $response;
?>