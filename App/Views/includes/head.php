<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.00, minimum-scale=1.00, maximum-scale=1.00, user-scalable=no" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@100..900&display=swap"
        rel="stylesheet" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=info" />
    <link
        href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
        rel="stylesheet" />
    <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
    <link rel="stylesheet" href="/css/styles.css?v=1.2" />
    <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=schedule" />
    <link
        rel="icon"
        type="image/x-icon"
        sizes="32x32"
        href="/assets/Logo/favicon/A-Type-Logo.ico" />
    <title>A-type | A minimalistic typing test website</title>
    <meta
        name="description"
        content="typing test website with a minimal design. Test yourself in various modes, track your progress and improve your speed." />
    <meta
        name="keywords"
        content="typing speed test, typing speedtest, typing test, speedtest, speed test, typing, test, typing-test, typing test, types, type, wpm, words per minute, typing website, minimalistic, custom typing test, customizable, customisable, themes, random words, smooth caret, smooth, new, new typing site, new typing website, minimalist typing website, minimalistic typing website, minimalist typing test" />
    <meta
        property="og:title"
        content="A-Type | A minimalistic typing test website" />
    <meta property="og:type" content="website" />
    <?php
    $useCanvasScript = isset($LOAD_CANVAS_SCRIPT) && $LOAD_CANVAS_SCRIPT === true;
    $scriptPath = ($useCanvasScript && defined('CANVAS_RENDERER') && CANVAS_RENDERER)
        ? '/js/main.js'
        : '/js/scripts.js';
    ?>
    <?php if ($useCanvasScript): ?>
    <style>
      @font-face {
        font-family: 'JetBrains Mono';
        src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
        font-style: normal;
        font-weight: 400;
        font-display: block;
      }

      @font-face {
        font-family: 'JetBrains Mono';
        src: url('/fonts/JetBrainsMono-Bold.woff2') format('woff2');
        font-style: normal;
        font-weight: 700;
        font-display: block;
      }
    </style>
    <?php endif; ?>
    <script type="module" src="<?php echo $scriptPath; ?>" defer></script>
</head>

</html>
