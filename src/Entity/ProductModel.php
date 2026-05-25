<?php

namespace App\Entity;

use App\Repository\ProductModelRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

#[ORM\Entity(repositoryClass: ProductModelRepository::class)]
#[Vich\Uploadable]
class ProductModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Vich\UploadableField(mapping: 'product_model', fileNameProperty: 'modelName', size: 'modelSize')]
    private ?File $modelFile = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $modelName = null;

    #[ORM\Column(nullable: true)]
    private ?int $modelSize = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $displayName = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'productModels')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Mueble $mueble = null;

    public function getId(): ?int { return $this->id; }

    public function getModelFile(): ?File { return $this->modelFile; }

    public function setModelFile(?File $modelFile): static
    {
        $this->modelFile = $modelFile;
        if ($modelFile !== null) {
            $this->updatedAt = new \DateTimeImmutable();
        }
        return $this;
    }

    public function getModelName(): ?string { return $this->modelName; }
    public function setModelName(?string $modelName): static { $this->modelName = $modelName; return $this; }

    public function getModelSize(): ?int { return $this->modelSize; }
    public function setModelSize(?int $modelSize): static { $this->modelSize = $modelSize; return $this; }

    public function getDisplayName(): ?string { return $this->displayName; }
    public function setDisplayName(?string $displayName): static { $this->displayName = $displayName; return $this; }

    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static { $this->updatedAt = $updatedAt; return $this; }

    public function getMueble(): ?Mueble { return $this->mueble; }
    public function setMueble(?Mueble $mueble): static { $this->mueble = $mueble; return $this; }
}
