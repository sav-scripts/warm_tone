<?php

include "tool.inc";
include "db.inc";

$sql = 'SELECT id FROM collection';
$result = mysql_query($sql, $link);


while ($row = mysql_fetch_object($result)) {
    echo json_encode($row);
}

?>