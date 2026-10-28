<?php

namespace App\Form\Admin;

use App\Entity\Category;
use App\Entity\Mueble;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\PositiveOrZero;

class MuebleType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'label' => 'Nombre',
                'constraints' => [new NotBlank(), new Length(max: 255)],
                'attr' => ['placeholder' => 'Ej: Sofá Modular Nube', 'autocomplete' => 'off'],
            ])
            ->add('descriptionAi', TextareaType::class, [
                'label'    => 'Descripción',
                'required' => false,
                'attr'     => ['rows' => 4, 'placeholder' => 'Descripción del producto…'],
            ])
            ->add('price', TextType::class, [
                'label'    => 'Precio (€)',
                'required' => false,
                'attr'     => ['type' => 'number', 'step' => '0.01', 'min' => '0', 'placeholder' => '0.00'],
            ])
            ->add('category', EntityType::class, [
                'label'        => 'Categoría',
                'class'        => Category::class,
                'choice_label' => 'name',
                'placeholder'  => '— Selecciona —',
            ])
            ->add('width', NumberType::class, [
                'label'    => 'Ancho',
                'required' => false,
                'html5'    => true,
                'scale'    => 1,
                'attr'     => ['step' => '0.1', 'min' => '0', 'placeholder' => '0.0'],
                'constraints' => [new PositiveOrZero()],
            ])
            ->add('height', NumberType::class, [
                'label'    => 'Alto',
                'required' => false,
                'html5'    => true,
                'scale'    => 1,
                'attr'     => ['step' => '0.1', 'min' => '0', 'placeholder' => '0.0'],
                'constraints' => [new PositiveOrZero()],
            ])
            ->add('depth', NumberType::class, [
                'label'    => 'Profundidad',
                'required' => false,
                'html5'    => true,
                'scale'    => 1,
                'attr'     => ['step' => '0.1', 'min' => '0', 'placeholder' => '0.0'],
                'constraints' => [new PositiveOrZero()],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults(['data_class' => Mueble::class]);
    }
}
