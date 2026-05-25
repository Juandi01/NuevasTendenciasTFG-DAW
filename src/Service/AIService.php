<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class AIService
{
    public function __construct(
        private HttpClientInterface $client,
        private string $aiApiKey
    ) {
        // Mantenemos las variables aquí para no romper la configuración de Symfony,
        // pero nuestro simulador no las va a usar porque es 100% independiente.
    }

    public function analyzeSentiment(string $text): string
    {
        // 1. Convertimos el texto a minúsculas para evitar fallos (Ej: "Malo" vs "malo")
        $textLower = mb_strtolower($text, 'UTF-8');

        // 2. Nuestros diccionarios de entrenamiento (Puedes añadir las que quieras)
        $palabrasPositivas = ['bueno', 'cómodo', 'bonito', 'perfecto', 'excelente', 'encanta', 'maravilla', 'suave', 'genial', 'recomendable', 'precioso', 'rápido'];
        $palabrasNegativas = ['malo', 'feo', 'incómodo', 'duro', 'roto', 'tarde', 'caro', 'horrible', 'decepción', 'mancha', 'peor', 'basura'];

        $puntuacion = 0;

        // 3. Sistema de puntuación
        foreach ($palabrasPositivas as $palabra) {
            if (str_contains($textLower, $palabra)) {
                $puntuacion++; // Suma 1 punto por cada cosa buena
            }
        }

        foreach ($palabrasNegativas as $palabra) {
            if (str_contains($textLower, $palabra)) {
                $puntuacion--; // Resta 1 punto por cada cosa mala
            }
        }

        // 4. El Veredicto Final
        if ($puntuacion > 0) {
            return 'Positivo';
        } elseif ($puntuacion < 0) {
            return 'Negativo';
        } else {
            return 'Neutro'; // Si no hay palabras, o si hay un empate (1 buena y 1 mala)
        }
    }
}