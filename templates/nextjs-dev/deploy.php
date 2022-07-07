<?php

move_uploaded_file($_FILES["build"]["tmp_name"],__DIR__."/build.zip");

echo shell_exec("./deploy.sh $_POST[commit] 2>&1");

echo "build successfully deployed";

?>
