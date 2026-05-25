<?php

namespace App\Controller;

use App\Entity\Review;
use App\Entity\ReviewToken;
use App\Repository\ReviewTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Service\AIService;

class ReviewController extends AbstractController
{
    #[Route('/opinar/{token}', name: 'app_review_form')]
    public function index(string $token, ReviewTokenRepository $tokenRepo, Request $request, EntityManagerInterface $em, AIService $ai): Response
    {
        // 1. Buscamos el token en la base de datos
        $reviewToken = $tokenRepo->findOneBy(['token' => $token]);

        // 2. Seguridad: Si no existe, ya se usó o caducó, mandamos a inicio
        if (!$reviewToken || $reviewToken->isUsed()) {
            $this->addFlash('error', 'Este enlace ya no es válido o ya has dejado tu reseña. ¡Gracias!');
            return $this->redirectToRoute('app_home');
        }

        // 3. Si el cliente envía el formulario (POST)
        if ($request->isMethod('POST')) {
            $review = new Review();
            $review->setRating((int)$request->request->get('rating'));
            $review->setComment($request->request->get('comment'));
            // --- IA ---
            $sentiment = $ai->analyzeSentiment($review->getComment());
            $review->setSentimentAi($sentiment);
            // --------------------------
            $review->setMueble($reviewToken->getMueble());
            $review->setToken($reviewToken);
            $review->setIsApproved(false); // Pendiente de moderación IA

            // Marcamos el token como usado para que no pueda repetir
            $reviewToken->setIsUsed(true);

            $em->persist($review);
            $em->flush();

            $this->addFlash('success', '¡Gracias por tu opinión! La revisaremos pronto.');
            return $this->redirectToRoute('app_home');
        }

        return $this->render('review/index.html.twig', [
            'token' => $reviewToken,
            'mueble' => $reviewToken->getMueble(),
        ]);
    }
}