
<?php
	$decoded = json_decode($_POST['json']);
	file_put_contents('js/data.json', json_encode($decoded));
?>