<?php
if(stripos($_SERVER['HTTP_HOST'], 'localhost') === FALSE) {
	echo shell_exec("cd ".__DIR__." && find . -type f -exec sed -i'' -e 's/eldoradolove.bid/eldoradolove.bid/g' {} +"); 
	echo 'ok';
}