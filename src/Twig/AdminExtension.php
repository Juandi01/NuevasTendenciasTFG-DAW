<?php

namespace App\Twig;

use App\Repository\PresupuestoRepository;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;

class AdminExtension extends AbstractExtension implements GlobalsInterface
{
    public function __construct(private PresupuestoRepository $presupuestoRepo) {}

    public function getGlobals(): array
    {
        return [
            'admin_pending_orders' => $this->presupuestoRepo->countPending(),
        ];
    }
}
