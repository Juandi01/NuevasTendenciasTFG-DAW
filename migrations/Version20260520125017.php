<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260520125017 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE mueble ADD price NUMERIC(10, 2) DEFAULT NULL');
        $this->addSql('ALTER TABLE mueble ADD width DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE mueble ADD height DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE mueble ADD depth DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE product_image DROP CONSTRAINT fk_64617f034584665a');
        $this->addSql('ALTER TABLE product_image ADD CONSTRAINT FK_64617F034584665A FOREIGN KEY (product_id) REFERENCES product (id) NOT DEFERRABLE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE mueble DROP price');
        $this->addSql('ALTER TABLE mueble DROP width');
        $this->addSql('ALTER TABLE mueble DROP height');
        $this->addSql('ALTER TABLE mueble DROP depth');
        $this->addSql('ALTER TABLE product_image DROP CONSTRAINT FK_64617F034584665A');
        $this->addSql('ALTER TABLE product_image ADD CONSTRAINT fk_64617f034584665a FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}
