<?php

namespace App\Entity;

enum PresupuestoEstado: string
{
    case PENDIENTE  = 'pending';
    case EN_PROCESO = 'processing';
    case RESPONDIDO = 'responded';

    public function label(): string
    {
        return match($this) {
            self::PENDIENTE  => 'Pendiente',
            self::EN_PROCESO => 'En proceso',
            self::RESPONDIDO => 'Respondido',
        };
    }

    public function badgeClass(): string
    {
        return match($this) {
            self::PENDIENTE  => 'badge-amber',
            self::EN_PROCESO => 'badge-cyan',
            self::RESPONDIDO => 'badge-green',
        };
    }

    public function icon(): string
    {
        return match($this) {
            self::PENDIENTE  => '⏳',
            self::EN_PROCESO => '⚙️',
            self::RESPONDIDO => '✅',
        };
    }

    /** @return PresupuestoEstado[] */
    public function nextStates(): array
    {
        return match($this) {
            self::PENDIENTE  => [self::EN_PROCESO, self::RESPONDIDO],
            self::EN_PROCESO => [self::RESPONDIDO],
            self::RESPONDIDO => [],
        };
    }
}
