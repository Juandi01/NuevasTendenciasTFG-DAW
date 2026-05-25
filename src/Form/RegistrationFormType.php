<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\TelType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class RegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nombre', TextType::class, [
                'label' => 'Nombre',
                'attr'  => ['placeholder' => 'Tu nombre', 'autocomplete' => 'given-name'],
            ])
            ->add('apellidos', TextType::class, [
                'label' => 'Apellidos',
                'attr'  => ['placeholder' => 'Tus apellidos', 'autocomplete' => 'family-name'],
            ])
            ->add('email', EmailType::class, [
                'label' => 'Email',
                'attr'  => ['placeholder' => 'tu@email.com', 'autocomplete' => 'email'],
            ])
            ->add('telefono', TelType::class, [
                'label'    => 'Teléfono',
                'required' => false,
                'attr'     => ['placeholder' => '+34 600 000 000', 'autocomplete' => 'tel'],
            ])
            ->add('plainPassword', RepeatedType::class, [
                'type'            => PasswordType::class,
                'mapped'          => false,
                'first_options'   => [
                    'label' => 'Contraseña',
                    'attr'  => ['placeholder' => 'Mínimo 8 caracteres', 'autocomplete' => 'new-password'],
                ],
                'second_options'  => [
                    'label' => 'Repite la contraseña',
                    'attr'  => ['placeholder' => 'Repite la contraseña', 'autocomplete' => 'new-password'],
                ],
                'invalid_message' => 'Las contraseñas no coinciden.',
                'constraints'     => [
                    new NotBlank(['message' => 'La contraseña es obligatoria.']),
                    new Length(['min' => 8, 'minMessage' => 'La contraseña debe tener al menos 8 caracteres.']),
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults(['data_class' => User::class]);
    }
}
