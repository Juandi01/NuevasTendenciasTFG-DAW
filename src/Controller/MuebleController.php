<?php

namespace App\Controller;

use App\Entity\Mueble;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\ReviewToken;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Uid\Uuid;


class MuebleController extends AbstractController
{
    // La ruta recibe el ID dinámico del mueble (ej: /mueble/1)
    #[Route('/configurador', name: 'app_mueble_configurator')]
    public function configurator(): Response
    {
        return $this->render('mueble/configurator.html.twig');
    }

    #[Route('/mueble/{id}', name: 'app_mueble_show')]
    public function show(Mueble $mueble): Response
    {
        return $this->render('mueble/show.html.twig', [
            'mueble'     => $mueble,
            'productKey' => $this->toProductKey($mueble->getName()),
        ]);
    }

    private function toProductKey(string $name): string
    {
        return match ($name) {
            'Orión'     => 'orion',
            'Sirio'     => 'sirio',
            'Vega'      => 'vega',
            'Andrómeda' => 'andromeda',
            'Nebula'    => 'nebula',
            'Cassiopea' => 'cassiopea',
            'Altair'    => 'altair',
            'Lyra'      => 'lyra',
            'Perseo'    => 'perseo',
            default     => strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name)),
        };
    }

    #[Route('/mueble/{id}/simular-compra', name: 'app_mueble_simulate_purchase', methods: ['POST'])]
    public function simulatePurchase(Mueble $mueble, EntityManagerInterface $em): Response
    {
        // 1. Creamos el token mágico
        $token = new ReviewToken();
        $token->setToken(Uuid::v4());
        $token->setCustomerContact('cliente-tfg@ejemplo.com');
        $token->setIsUsed(false);
        $token->setExpiresAt(new \DateTimeImmutable('+30 days'));
        $token->setMueble($mueble);

        $em->persist($token);
        $em->flush();

        // 2. Avisamos al usuario y le damos el link
        $this->addFlash('success', '¡Compra simulada! Enlace generado.');
        $this->addFlash('magic_link', $token->getToken());

        return $this->redirectToRoute('app_mueble_show', ['id' => $mueble->getId()]);
    }
}