<?php

namespace App\Controller;

use App\Repository\CategoryRepository;
use App\Repository\MuebleRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(Request $request, MuebleRepository $muebleRepository, CategoryRepository $categoryRepository): Response
    {
        $filters = [
            'category' => $request->query->get('category', ''),
            'priceMin' => $request->query->get('priceMin', ''),
            'priceMax' => $request->query->get('priceMax', ''),
            'sort'     => $request->query->get('sort', 'name_asc'),
        ];

        $muebles    = $muebleRepository->findFiltered($filters);
        $categories = $categoryRepository->findAll();

        return $this->render('home/index.html.twig', [
            'muebles'    => $muebles,
            'categories' => $categories,
            'filters'    => $filters,
        ]);
    }
}
