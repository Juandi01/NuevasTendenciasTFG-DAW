<?php

namespace App\DataFixtures;

use App\Entity\Category;
use App\Entity\Image;
use App\Entity\Mueble;
use App\Entity\Option;
use App\Entity\Variation;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // ── Categorías ────────────────────────────────────────────────
        $catSofa      = $this->category($manager, 'Sofás',         'sofas');
        $catRinconera = $this->category($manager, 'Rinconeras',    'rinconeras');
        $catChaise    = $this->category($manager, 'Chaise Longue', 'chaise-longue');

        // ── Opciones compartidas (patas y tapicería) ──────────────────
        $pataMadera = $this->opt($manager, 'pata', 'Madera Natural');
        $pataMetal  = $this->opt($manager, 'pata', 'Metal Negro');
        $tapTela    = $this->opt($manager, 'tapiceria', 'Tela');
        $tapPiel    = $this->opt($manager, 'tapiceria', 'Piel');
        $tapVelvet  = $this->opt($manager, 'tapiceria', 'Terciopelo');

        // ─────────────────────────────────────────────────────────────
        // SOFÁS
        // ─────────────────────────────────────────────────────────────

        $this->mueble($manager, 'Orión', $catSofa, '899.00',
            'Como el cazador más brillante del cosmos, Orión ocupa el espacio con una '
            . 'presencia magnética. Sus dos plazas invitan a la contemplación estelar '
            . 'desde la comodidad más profunda del universo.',
            [
                ['Gris Marengo',    '4a4a5a', 'FFFFFF'],
                ['Beige Arena',     'd4c5a9', '4a4a5a'],
                ['Azul Medianoche', '191b4a', 'FFFFFF'],
            ],
            $pataMadera, $tapTela, 'ORION',
        );

        $this->mueble($manager, 'Sirio', $catSofa, '1199.00',
            'La estrella más luminosa del cielo nocturno se convierte en sofá. Sirio '
            . 'ilumina cualquier estancia con su elegancia de tres plazas, diseñado '
            . 'para constelaciones familiares que buscan el máximo confort.',
            [
                ['Azul Medianoche', '191b4a', 'FFFFFF'],
                ['Gris Antracita',  '383840', 'FFFFFF'],
                ['Verde Bosque',    '2d5a3d', 'FFFFFF'],
            ],
            $pataMadera, $tapVelvet, 'SIRIO',
        );

        $this->mueble($manager, 'Vega', $catSofa, '799.00',
            'Quinta estrella más brillante del firmamento, Vega desciende a tu salón '
            . 'con serena elegancia. Su diseño de dos plazas en tonos cálidos evoca '
            . 'la calidez de las nebulosas doradas del universo profundo.',
            [
                ['Beige Arena', 'd4c5a9', '4a4a5a'],
                ['Gris Perla',  'c8c8d0', '4a4a5a'],
                ['Terracota',   'b85042', 'FFFFFF'],
            ],
            $pataMadera, $tapTela, 'VEGA',
        );

        // ─────────────────────────────────────────────────────────────
        // RINCONERAS
        // ─────────────────────────────────────────────────────────────

        $this->mueble($manager, 'Andrómeda', $catRinconera, '1599.00',
            'La galaxia más cercana a la Vía Láctea toma forma de rinconera izquierda. '
            . 'Andrómeda abraza cada rincón del espacio habitable irradiando la '
            . 'serenidad de los bosques cósmicos en cada fibra de su tapizado.',
            [
                ['Verde Bosque',   '2d5a3d', 'FFFFFF'],
                ['Azul Petroleo',  '1a4a5c', 'FFFFFF'],
                ['Gris Antracita', '383840', 'FFFFFF'],
            ],
            $pataMetal, $tapTela, 'ANDROMEDA',
        );

        $this->mueble($manager, 'Nebula', $catRinconera, '1799.00',
            'Una nube de gas y polvo interestelar cristalizada en forma de rinconera '
            . 'derecha. Nebula expande el confort por toda la habitación como una '
            . 'nebulosa que coloniza el cosmos de tu hogar.',
            [
                ['Gris Antracita',  '383840', 'FFFFFF'],
                ['Gris Marengo',    '4a4a5a', 'FFFFFF'],
                ['Azul Medianoche', '191b4a', 'FFFFFF'],
            ],
            $pataMetal, $tapVelvet, 'NEBULA',
        );

        $this->mueble($manager, 'Cassiopea', $catRinconera, '1699.00',
            'La constelación en forma de W que guía a los navegantes estelares ahora '
            . 'guía tu descanso. Cassiopea, rinconera izquierda en tonos océano '
            . 'profundo, captura la esencia de los mares cósmicos en cada centímetro.',
            [
                ['Azul Petroleo',   '1a4a5c', 'FFFFFF'],
                ['Verde Bosque',    '2d5a3d', 'FFFFFF'],
                ['Azul Medianoche', '191b4a', 'FFFFFF'],
            ],
            $pataMetal, $tapPiel, 'CASSIOPEA',
        );

        // ─────────────────────────────────────────────────────────────
        // CHAISE LONGUE
        // ─────────────────────────────────────────────────────────────

        $this->mueble($manager, 'Altair', $catChaise, '1099.00',
            'La estrella del Águila brilla con la intensidad de una supernova. '
            . 'Altair, chaise longue derecha, ofrece una superficie de descanso '
            . 'tan vasta como el espacio interestelar, en tonos terracota que '
            . 'evocan planetas áridos y magnéticos.',
            [
                ['Terracota',   'b85042', 'FFFFFF'],
                ['Mostaza',     'c8a820', '191b4a'],
                ['Beige Arena', 'd4c5a9', '4a4a5a'],
            ],
            $pataMadera, $tapPiel, 'ALTAIR',
        );

        $this->mueble($manager, 'Lyra', $catChaise, '999.00',
            'La constelación de la lira resuena en forma de chaise longue izquierda. '
            . 'Lyra compone una sinfonía de colores cálidos que inundan el salón '
            . 'con la energía luminosa de las estrellas variables del universo profundo.',
            [
                ['Mostaza',      'c8a820', '191b4a'],
                ['Terracota',    'b85042', 'FFFFFF'],
                ['Verde Bosque', '2d5a3d', 'FFFFFF'],
            ],
            $pataMadera, $tapTela, 'LYRA',
        );

        $this->mueble($manager, 'Perseo', $catChaise, '1149.00',
            'El héroe de las constelaciones desciende para conquistar tu salón. '
            . 'Perseo, chaise longue derecha en gris perla, refleja la luz como '
            . 'los anillos de Saturno, aportando una luminosidad etérea que '
            . 'transforma cualquier espacio.',
            [
                ['Gris Perla',  'c8c8d0', '4a4a5a'],
                ['Gris Marengo','4a4a5a', 'FFFFFF'],
                ['Beige Arena', 'd4c5a9', '4a4a5a'],
            ],
            $pataMadera, $tapVelvet, 'PERSEO',
        );

        $manager->flush();
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private function category(ObjectManager $m, string $name, string $slug): Category
    {
        $c = new Category();
        $c->setName($name)->setSlug($slug);
        $m->persist($c);
        return $c;
    }

    private function opt(ObjectManager $m, string $type, string $name, ?string $value = null): Option
    {
        $o = new Option();
        $o->setType($type)->setName($name)->setValue($value);
        $m->persist($o);
        return $o;
    }

    /**
     * Crea un Mueble con N variaciones de color.
     * $colors: array de [nombre, hex sin #, hex texto sin #]
     *
     * @param list<array{0:string,1:string,2:string}> $colors
     */
    private function mueble(
        ObjectManager $m,
        string $name,
        Category $cat,
        string $price,
        string $desc,
        array $colors,
        Option $pata,
        Option $tapiceria,
        string $skuPrefix,
    ): void {
        $mueble = new Mueble();
        $mueble->setName($name)
               ->setDescriptionAi($desc)
               ->setPrice($price)
               ->setIsActive(true)
               ->setCategory($cat);
        $m->persist($mueble);

        foreach ($colors as [$colorName, $bgHex, $fgHex]) {
            $colorOpt = new Option();
            $colorOpt->setType('color')
                     ->setName($colorName)
                     ->setValue('#' . $bgHex);
            $m->persist($colorOpt);

            $img = new Image();
            $img->setUrl(
                    'https://placehold.co/600x400/' . $bgHex . '/' . $fgHex
                    . '/png?text=' . rawurlencode($name)
                )
                ->setIsMain(true)
                ->setOption($colorOpt);
            $m->persist($img);

            $skuSlug = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $colorName));
            $var = new Variation();
            $var->setSku($skuPrefix . '-' . $skuSlug)
                ->setIsActive(true)
                ->setMueble($mueble)
                ->addOption($colorOpt)
                ->addOption($pata)
                ->addOption($tapiceria);
            $m->persist($var);
        }
    }
}
