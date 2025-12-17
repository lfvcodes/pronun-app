<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$wordsFile = '../data/words.json';

$random = isset($_GET['random']) && $_GET['random'] === 'true';
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 0;

if (file_exists($wordsFile)) {
    $jsonContent = file_get_contents($wordsFile);

    $words = json_decode($jsonContent, true);

    if ($words !== null) {
        if ($random) {
            shuffle($words);
        }

        if ($limit > 0 && $limit < count($words)) {
            $words = array_slice($words, 0, $limit);
        }
        $categories = [];
        foreach ($words as $word) {
            $rule = $word['rule'] ?? 'Desconocida';
            if (!isset($categories[$rule])) {
                $categories[$rule] = 0;
            }
            $categories[$rule]++;
        }

        echo json_encode([
            'success' => true,
            'count' => count($words),
            'randomized' => $random,
            'categories' => $categories,
            'words' => $words
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al decodificar el archivo JSON'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Archivo de palabras no encontrado'
    ]);
}
?>