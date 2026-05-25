<?php

namespace App\Repository;

use App\Entity\Category;
use App\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    public function findActive(): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.isActive = true')
            ->orderBy('p.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByCategory(Category $category): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.category = :category')
            ->andWhere('p.isActive = true')
            ->setParameter('category', $category)
            ->orderBy('p.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByPriceRange(float $min, float $max): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.isActive = true')
            ->andWhere('p.price >= :min')
            ->andWhere('p.price <= :max')
            ->setParameter('min', $min)
            ->setParameter('max', $max)
            ->orderBy('p.price', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Filtra productos según los criterios disponibles.
     *
     * @param array{
     *   search?: string,
     *   category?: int,
     *   min_price?: float,
     *   max_price?: float,
     *   max_width?: float,
     *   max_height?: float,
     *   max_depth?: float,
     * } $filters
     */
    public function findFiltered(array $filters): array
    {
        $qb = $this->createQueryBuilder('p')
            ->join('p.category', 'c')
            ->where('p.isActive = true');

        if (!empty($filters['search'])) {
            $qb->andWhere('p.name LIKE :search OR p.description LIKE :search')
               ->setParameter('search', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['category'])) {
            $qb->andWhere('c.id = :category')
               ->setParameter('category', (int) $filters['category']);
        }

        if (isset($filters['min_price']) && $filters['min_price'] !== '') {
            $qb->andWhere('p.price >= :min_price')
               ->setParameter('min_price', (float) $filters['min_price']);
        }

        if (isset($filters['max_price']) && $filters['max_price'] !== '') {
            $qb->andWhere('p.price <= :max_price')
               ->setParameter('max_price', (float) $filters['max_price']);
        }

        if (!empty($filters['max_width'])) {
            $qb->andWhere('p.width <= :max_width')
               ->setParameter('max_width', (float) $filters['max_width']);
        }

        if (!empty($filters['max_height'])) {
            $qb->andWhere('p.height <= :max_height')
               ->setParameter('max_height', (float) $filters['max_height']);
        }

        if (!empty($filters['max_depth'])) {
            $qb->andWhere('p.depth <= :max_depth')
               ->setParameter('max_depth', (float) $filters['max_depth']);
        }

        return $qb->orderBy('p.name', 'ASC')
                  ->getQuery()
                  ->getResult();
    }
}
