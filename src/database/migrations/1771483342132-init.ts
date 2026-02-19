import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1771483342132 implements MigrationInterface {
    name = 'Init1771483342132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "brands" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "logoUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6" UNIQUE ("name"), CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "brandId" integer`);
        await queryRunner.query(`ALTER TABLE "brands" ADD CONSTRAINT "FK_2b023abd085d111caa06dd5be60" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_b245dea25ee35b6a6e48f1c743a" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_b245dea25ee35b6a6e48f1c743a"`);
        await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT "FK_2b023abd085d111caa06dd5be60"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "brandId"`);
        await queryRunner.query(`DROP TABLE "brands"`);
    }

}
