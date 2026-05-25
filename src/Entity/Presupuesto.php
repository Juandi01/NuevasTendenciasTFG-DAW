<?php

namespace App\Entity;

use App\Repository\PresupuestoRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PresupuestoRepository::class)]
#[ORM\Table(name: 'presupuesto')]
#[ORM\HasLifecycleCallbacks]
class Presupuesto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // ── Producto de referencia ────────────────────────────────
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Mueble $mueble = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Variation $selectedVariation = null;

    // ── Configuración del wizard ──────────────────────────────
    #[ORM\Column(length: 30, nullable: true)]
    private ?string $configuracionModelo = null;

    #[ORM\Column(length: 30, nullable: true)]
    private ?string $configuracionTapiceria = null;

    #[ORM\Column(length: 10, nullable: true)]
    private ?string $configuracionColor = null;

    #[ORM\Column(length: 30, nullable: true)]
    private ?string $configuracionPatas = null;

    // ── Datos de contacto ─────────────────────────────────────
    #[ORM\Column(length: 120)]
    private string $customerName = '';

    #[ORM\Column(length: 180)]
    private string $customerEmail = '';

    #[ORM\Column(length: 30, nullable: true)]
    private ?string $customerPhone = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    // ── Usuario autenticado (opcional) ───────────────────────
    #[ORM\ManyToOne(inversedBy: 'presupuestos')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $user = null;

    // ── Estado ───────────────────────────────────────────────
    #[ORM\Column(length: 20, enumType: PresupuestoEstado::class)]
    private PresupuestoEstado $estado = PresupuestoEstado::PENDIENTE;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function onUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    // ── Getters / Setters ─────────────────────────────────────

    public function getId(): ?int { return $this->id; }

    public function getMueble(): ?Mueble { return $this->mueble; }
    public function setMueble(?Mueble $mueble): static { $this->mueble = $mueble; return $this; }

    public function getSelectedVariation(): ?Variation { return $this->selectedVariation; }
    public function setSelectedVariation(?Variation $v): static { $this->selectedVariation = $v; return $this; }

    public function getConfiguracionModelo(): ?string { return $this->configuracionModelo; }
    public function setConfiguracionModelo(?string $v): static { $this->configuracionModelo = $v; return $this; }

    public function getConfiguracionTapiceria(): ?string { return $this->configuracionTapiceria; }
    public function setConfiguracionTapiceria(?string $v): static { $this->configuracionTapiceria = $v; return $this; }

    public function getConfiguracionColor(): ?string { return $this->configuracionColor; }
    public function setConfiguracionColor(?string $v): static { $this->configuracionColor = $v; return $this; }

    public function getConfiguracionPatas(): ?string { return $this->configuracionPatas; }
    public function setConfiguracionPatas(?string $v): static { $this->configuracionPatas = $v; return $this; }

    public function getCustomerName(): string { return $this->customerName; }
    public function setCustomerName(string $name): static { $this->customerName = $name; return $this; }

    public function getCustomerEmail(): string { return $this->customerEmail; }
    public function setCustomerEmail(string $email): static { $this->customerEmail = $email; return $this; }

    public function getCustomerPhone(): ?string { return $this->customerPhone; }
    public function setCustomerPhone(?string $phone): static { $this->customerPhone = $phone; return $this; }

    public function getNotes(): ?string { return $this->notes; }
    public function setNotes(?string $notes): static { $this->notes = $notes; return $this; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getEstado(): PresupuestoEstado { return $this->estado; }
    public function setEstado(PresupuestoEstado $estado): static { $this->estado = $estado; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
}
