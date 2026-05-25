<?php

namespace App\Command;

use App\Entity\ReviewToken;
use App\Repository\MuebleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Uid\Uuid;

#[AsCommand(name: 'app:generate-token', description: 'Genera un token de prueba')]
class GenerateTokenCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private MuebleRepository $muebleRepo
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $mueble = $this->muebleRepo->findOneBy([]); // Cogemos el primer mueble que haya

        if (!$mueble) {
            $io->error('No hay muebles en la base de datos. ¡Carga las fixtures primero!');
            return Command::FAILURE;
        }

        $token = new ReviewToken();
        $token->setToken(Uuid::v4()); // Generamos un UUID real
        $token->setCustomerContact('cliente@ejemplo.com');
        $token->setIsUsed(false);
        $token->setExpiresAt(new \DateTimeImmutable('+7 days'));
        $token->setMueble($mueble);

        $this->em->persist($token);
        $this->em->flush();

        $io->success('Token generado con éxito para: ' . $mueble->getName());
        $io->info('Copia este enlace: http://127.0.0.1:8000/opinar/' . $token->getToken());

        return Command::SUCCESS;
    }
}