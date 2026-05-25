<?php

namespace App\Entity;

use App\Repository\CategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CategoryRepository::class)]
class Category
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    private ?string $slug = null;

    /**
     * @var Collection<int, Mueble>
     */
    #[ORM\OneToMany(targetEntity: Mueble::class, mappedBy: 'category')]
    private Collection $muebles;

    public function __construct()
    {
        $this->muebles = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * @return Collection<int, Mueble>
     */
    public function getMuebles(): Collection
    {
        return $this->muebles;
    }

    public function addMueble(Mueble $mueble): static
    {
        if (!$this->muebles->contains($mueble)) {
            $this->muebles->add($mueble);
            $mueble->setCategory($this);
        }

        return $this;
    }

    public function removeMueble(Mueble $mueble): static
    {
        if ($this->muebles->removeElement($mueble)) {
            // set the owning side to null (unless already changed)
            if ($mueble->getCategory() === $this) {
                $mueble->setCategory(null);
            }
        }

        return $this;
    }
}
