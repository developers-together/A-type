<?php

require_once __DIR__ . '/../App/Config/config.php';

spl_autoload_register(function ($class) {

    $prefix = 'App\\';

    $base_dir = __DIR__ . '/../App/' ;

    // $file = $base_dir . str_replace('\\', '/', $class) . '.php';

    $len = strlen($prefix);

    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    $relative_substring = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_substring) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

use App\Core\App;
$app = new App();
