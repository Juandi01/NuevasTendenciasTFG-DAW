<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[UniqueEntity(fields: ['email'], message: 'Este email ya está registrado.')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Assert\NotBlank(message: 'El email es obligatorio.')]
    #[Assert\Email(message: 'Introduce un email válido.')]
    private ?string $email = null;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private ?string $password = null;

    #[Assert\NotBlank(message: 'La contraseña es obligatoria.', groups: ['registration'])]
    #[Assert\Length(min: 8, minMessage: 'La contraseña debe tener al menos 8 caracteres.', groups: ['registration'])]
    private ?string $plainPassword = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'El nombre es obligatorio.')]
    #[Assert\Length(max: 100)]
    private ?string $nombre = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Los apellidos son obligatorios.')]
    #[Assert\Length(max: 100)]
    private ?string $apellidos = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Assert\Length(max: 20)]
    private ?string $telefono = null;

    #[ORM\OneToMany(targetEntity: Presupuesto::class, mappedBy: 'user', orphanRemoval: false)]
    #[ORM\OrderBy(['createdAt' => 'DESC'])]
    private Collection $presupuestos;

    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'user', orphanRemoval: false)]
    #[ORM\OrderBy(['id' => 'DESC'])]
    private Collection $reviews;

    public function __construct()
    {
        $this->presupuestos = new ArrayCollection();
        $this->reviews      = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getEmail(): ?string { return $this->email; }
    public function setEmail(string $email): static { $this->email = $email; return $this; }

    public function getUserIdentifier(): string { return (string) $this->email; }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }
    public function setRoles(array $roles): static { $this->roles = $roles; return $this; }

    public function getPassword(): ?string { return $this->password; }
    public function setPassword(string $password): static { $this->password = $password; return $this; }

    public function getPlainPassword(): ?string { return $this->plainPassword; }
    public function setPlainPassword(?string $plainPassword): static { $this->plainPassword = $plainPassword; return $this; }

    public function eraseCredentials(): void { $this->plainPassword = null; }

    public function getNombre(): ?string { return $this->nombre; }
    public function setNombre(string $nombre): static { $this->nombre = $nombre; return $this; }

    public function getApellidos(): ?string { return $this->apellidos; }
    public function setApellidos(string $apellidos): static { $this->apellidos = $apellidos; return $this; }

    public function getTelefono(): ?string { return $this->telefono; }
    public function setTelefono(?string $telefono): static { $this->telefono = $telefono; return $this; }

    public function getNombreCompleto(): string { return $this->nombre . ' ' . $this->apellidos; }

    /** @return Collection<int, Presupuesto> */
    public function getPresupuestos(): Collection { return $this->presupuestos; }

    /** @return Collection<int, Review> */
    public function getReviews(): Collection { return $this->reviews; }
}
