<?php

namespace App\Repository;

use App\Entity\Mueble;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Mueble>
 */
class MuebleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Mueble::class);
    }

    /**
     * @return array{items: Mueble[], total: int, pages: int, page: int, perPage: int}
     */
    public function findPaginated(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $qb = $this->createQueryBuilder('m')
            ->join('m.category', 'c')
            ->addSelect('c');

        if (!empty($filters['q'])) {
            $qb->andWhere('LOWER(m.name) LIKE LOWER(:q) OR LOWER(m.descriptionAi) LIKE LOWER(:q)')
               ->setParameter('q', '%' . $filters['q'] . '%');
        }
        if (!empty($filters['category'])) {
            $qb->andWhere('c.id = :cat')
               ->setParameter('cat', (int) $filters['category']);
        }
        if (isset($filters['active']) && $filters['active'] !== '') {
            $qb->andWhere('m.isActive = :active')
               ->setParameter('active', (bool) $filters['active']);
        }

        $total = (int) (clone $qb)
            ->select('COUNT(m.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $items = $qb->orderBy('m.id', 'DESC')
            ->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage)
            ->getQuery()
            ->getResult();

        return [
            'items'   => $items,
            'total'   => $total,
            'pages'   => max(1, (int) ceil($total / $perPage)),
            'page'    => $page,
            'perPage' => $perPage,
        ];
    }

    /** @return Mueble[] filtered and sorted for the catalog */
    public function findFiltered(array $filters = []): array
    {
        $qb = $this->createQueryBuilder('m')
            ->leftJoin('m.category', 'c')
            ->addSelect('c')
            ->andWhere('m.isActive = :active')
            ->setParameter('active', true);

        if (!empty($filters['category'])) {
            $qb->andWhere('c.id = :cat')
               ->setParameter('cat', (int) $filters['category']);
        }
        if (isset($filters['priceMin']) && $filters['priceMin'] !== '') {
            $qb->andWhere('m.price >= :priceMin')
               ->setParameter('priceMin', (float) $filters['priceMin']);
        }
        if (isset($filters['priceMax']) && $filters['priceMax'] !== '') {
            $qb->andWhere('m.price <= :priceMax')
               ->setParameter('priceMax', (float) $filters['priceMax']);
        }

        match ($filters['sort'] ?? 'name_asc') {
            'price_asc'  => $qb->orderBy('m.price', 'ASC'),
            'price_desc' => $qb->orderBy('m.price', 'DESC'),
            default      => $qb->orderBy('m.name', 'ASC'),
        };

        return $qb->getQuery()->getResult();
    }

    /** @return Mueble[] sorted by review count desc */
    public function findTopByReviews(int $limit = 5): array
    {
        return $this->createQueryBuilder('m')
            ->leftJoin('m.reviews', 'r')
            ->addSelect('COUNT(r.id) AS HIDDEN reviewCount')
            ->groupBy('m.id')
            ->orderBy('reviewCount', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
