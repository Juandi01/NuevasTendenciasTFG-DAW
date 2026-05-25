<?php

namespace App\Repository;

use App\Entity\Presupuesto;
use App\Entity\PresupuestoEstado;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Presupuesto> */
class PresupuestoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Presupuesto::class);
    }

    public function findPaginated(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.mueble', 'm')
            ->addSelect('m')
            ->orderBy('p.createdAt', 'DESC');

        if (!empty($filters['q'])) {
            $qb->andWhere('p.customerName LIKE :q OR p.customerEmail LIKE :q OR m.name LIKE :q')
               ->setParameter('q', '%' . $filters['q'] . '%');
        }

        if (!empty($filters['status'])) {
            $qb->andWhere('p.estado = :status')
               ->setParameter('status', $filters['status']);
        }

        $total = (clone $qb)
            ->select('COUNT(p.id)')
            ->resetDQLPart('orderBy')
            ->getQuery()
            ->getSingleScalarResult();

        $items = $qb
            ->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage)
            ->getQuery()
            ->getResult();

        return [
            'items'   => $items,
            'total'   => (int) $total,
            'pages'   => (int) ceil($total / $perPage),
            'page'    => $page,
            'perPage' => $perPage,
        ];
    }

    public function countPending(): int
    {
        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.estado = :estado')
            ->setParameter('estado', PresupuestoEstado::PENDIENTE)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
