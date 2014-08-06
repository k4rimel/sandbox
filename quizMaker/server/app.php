<?php
	$files = array();
	$data = array_diff(scandir('../data/themes/'), Array( ".", ".." ));
	foreach ($data as $key => $value) {
		$files []=$value;
	}
	echo json_encode($files);
?>
