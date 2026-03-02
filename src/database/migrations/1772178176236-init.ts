import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1772178176236 implements MigrationInterface {
    name = 'Init1772178176236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ADD "publishedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "publishedAt"`);
    }

}
