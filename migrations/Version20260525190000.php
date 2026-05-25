<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260525190000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add User entity and link to Presupuesto and Review';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE "user" (
            id SERIAL NOT NULL,
            email VARCHAR(180) NOT NULL,
            roles JSON NOT NULL,
            password VARCHAR(255) NOT NULL,
            nombre VARCHAR(100) NOT NULL,
            apellidos VARCHAR(100) NOT NULL,
            telefono VARCHAR(20) DEFAULT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649E7927C74 ON "user" (email)');

        $this->addSql('ALTER TABLE presupuesto ADD COLUMN user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE presupuesto ADD CONSTRAINT FK_presupuesto_user FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_presupuesto_user ON presupuesto (user_id)');

        $this->addSql('ALTER TABLE review ADD COLUMN user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT FK_review_user FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_review_user ON review (user_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE review DROP CONSTRAINT FK_review_user');
        $this->addSql('DROP INDEX IDX_review_user');
        $this->addSql('ALTER TABLE review DROP COLUMN user_id');

        $this->addSql('ALTER TABLE presupuesto DROP CONSTRAINT FK_presupuesto_user');
        $this->addSql('DROP INDEX IDX_presupuesto_user');
        $this->addSql('ALTER TABLE presupuesto DROP COLUMN user_id');

        $this->addSql('DROP TABLE "user"');
    }
}
