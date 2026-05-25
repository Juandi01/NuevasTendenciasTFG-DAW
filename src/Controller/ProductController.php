<?php

namespace App\Controller;

use App\Entity\Product;
use App\Repository\CategoryRepository;
use App\Repository\ProductRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ProductController extends AbstractController
{
    #[Route('/productos', name: 'app_product_index')]
    public function index(Request $request, ProductRepository $productRepo, CategoryRepository $categoryRepo): Response
    {
        $filters = array_filter([
            'search'     => $request->query->get('search'),
            'category'   => $request->query->get('category'),
            'min_price'  => $request->query->get('min_price'),
            'max_price'  => $request->query->get('max_price'),
            'max_width'  => $request->query->get('max_width'),
            'max_height' => $request->query->get('max_height'),
            'max_depth'  => $request->query->get('max_depth'),
        ], fn($v) => $v !== null && $v !== '');

        $products   = $productRepo->findFiltered($filters);
        $categories = $categoryRepo->findAll();

        $templateData = [
            'products'   => $products,
            'categories' => $categories,
            'filters'    => $filters,
        ];

        // Turbo Frame: devuelve solo el partial para no enviar el layout completo
        if ($request->headers->get('Turbo-Frame') === 'product-grid') {
            return $this->render('product/_grid.html.twig', $templateData);
        }

        return $this->render('product/index.html.twig', $templateData);
    }

    #[Route('/productos/{id}', name: 'app_product_show')]
    public function show(Product $product): Response
    {
        return $this->render('product/show.html.twig', [
            'product' => $product,
        ]);
    }
}
