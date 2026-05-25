<?php

namespace App\Entity;

use App\Repository\MuebleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MuebleRepository::class)]
class Mueble
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $descriptionAi = null;

    #[ORM\Column]
    private ?bool $isActive = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $price = null;

    #[ORM\Column(nullable: true)]
    private ?float $width = null;

    #[ORM\Column(nullable: true)]
    private ?float $height = null;

    #[ORM\Column(nullable: true)]
    private ?float $depth = null;

    #[ORM\ManyToOne(inversedBy: 'muebles')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Category $category = null;

    /**
     * @var Collection<int, Variation>
     */
    #[ORM\OneToMany(targetEntity: Variation::class, mappedBy: 'mueble', orphanRemoval: true)]
    private Collection $variations;

    /**
     * @var Collection<int, Review>
     */
    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'mueble', orphanRemoval: true)]
    private Collection $reviews;

    #[ORM\OneToMany(targetEntity: ProductMedia::class, mappedBy: 'mueble', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $medias;

    #[ORM\OneToMany(targetEntity: ProductModel::class, mappedBy: 'mueble', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $productModels;

    public function __construct()
    {
        $this->variations    = new ArrayCollection();
        $this->reviews       = new ArrayCollection();
        $this->medias        = new ArrayCollection();
        $this->productModels = new ArrayCollection();
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

    public function getDescriptionAi(): ?string
    {
        return $this->descriptionAi;
    }

    public function setDescriptionAi(?string $descriptionAi): static
    {
        $this->descriptionAi = $descriptionAi;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

        return $this;
    }

    public function getPrice(): ?string
    {
        return $this->price;
    }

    public function setPrice(?string $price): static
    {
        $this->price = $price;
        return $this;
    }

    public function getWidth(): ?float
    {
        return $this->width;
    }

    public function setWidth(?float $width): static
    {
        $this->width = $width;
        return $this;
    }

    public function getHeight(): ?float
    {
        return $this->height;
    }

    public function setHeight(?float $height): static
    {
        $this->height = $height;
        return $this;
    }

    public function getDepth(): ?float
    {
        return $this->depth;
    }

    public function setDepth(?float $depth): static
    {
        $this->depth = $depth;
        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): static
    {
        $this->category = $category;

        return $this;
    }

    /**
     * @return Collection<int, Variation>
     */
    public function getVariations(): Collection
    {
        return $this->variations;
    }

    public function addVariation(Variation $variation): static
    {
        if (!$this->variations->contains($variation)) {
            $this->variations->add($variation);
            $variation->setMueble($this);
        }

        return $this;
    }

    public function removeVariation(Variation $variation): static
    {
        if ($this->variations->removeElement($variation)) {
            // set the owning side to null (unless already changed)
            if ($variation->getMueble() === $this) {
                $variation->setMueble(null);
            }
        }

        return $this;
    }

    /**
     * Devuelve la primera foto que encuentre para la portada
     */
    public function getImagenPortada(): string
    {
        foreach ($this->variations as $variation) {
            foreach ($variation->getOptions() as $option) {
                if (!$option->getImages()->isEmpty()) {
                    return $option->getImages()->first()->getUrl();
                }
            }
        }
        
        return 'https://placehold.co/600x400?text=Sin+Foto';
    }

    /**
     * @return Collection<int, Review>
     */
    public function getReviews(): Collection
    {
        return $this->reviews;
    }

    public function addReview(Review $review): static
    {
        if (!$this->reviews->contains($review)) {
            $this->reviews->add($review);
            $review->setMueble($this);
        }

        return $this;
    }

    public function removeReview(Review $review): static
    {
        if ($this->reviews->removeElement($review)) {
            if ($review->getMueble() === $this) {
                $review->setMueble(null);
            }
        }
        return $this;
    }

    /** @return Collection<int, ProductMedia> */
    public function getMedias(): Collection { return $this->medias; }

    public function addMedia(ProductMedia $media): static
    {
        if (!$this->medias->contains($media)) {
            $this->medias->add($media);
            $media->setMueble($this);
        }
        return $this;
    }

    public function removeMedia(ProductMedia $media): static
    {
        $this->medias->removeElement($media);
        return $this;
    }

    /** @return Collection<int, ProductModel> */
    public function getProductModels(): Collection { return $this->productModels; }

    public function addProductModel(ProductModel $model): static
    {
        if (!$this->productModels->contains($model)) {
            $this->productModels->add($model);
            $model->setMueble($this);
        }
        return $this;
    }

    public function removeProductModel(ProductModel $model): static
    {
        $this->productModels->removeElement($model);
        return $this;
    }
}


