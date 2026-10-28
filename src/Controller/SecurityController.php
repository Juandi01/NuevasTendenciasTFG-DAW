<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class SecurityController extends AbstractController
{
    // Formulario de login exclusivo para administradores.
    #[Route('/admin/login', name: 'app_admin_login')]
    public function adminLogin(AuthenticationUtils $authenticationUtils): Response
    {
        if ($this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('app_admin_dashboard');
        }

        return $this->render('security/login.html.twig', [
            'error'         => $authenticationUtils->getLastAuthenticationError(),
            'last_username' => $authenticationUtils->getLastUsername(),
        ]);
    }

    // Ruta legacy /login — redirigida permanentemente al home público.
    #[Route('/login', name: 'app_login')]
    public function login(): Response
    {
        return $this->redirect($this->generateUrl('app_home'), Response::HTTP_MOVED_PERMANENTLY);
    }

    #[Route('/logout', name: 'app_logout')]
    public function logout(): void
    {
        // Symfony intercepta esta ruta automáticamente.
    }

    // Ruta legacy /registro — redirigida permanentemente al home público.
    #[Route('/registro', name: 'app_register')]
    public function register(): Response
    {
        return $this->redirect($this->generateUrl('app_home'), Response::HTTP_MOVED_PERMANENTLY);
    }
}
