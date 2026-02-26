import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1772005779445 implements MigrationInterface {
    name = 'Init1772005779445'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."articles_status_enum" AS ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "status" "public"."articles_status_enum" NOT NULL DEFAULT 'DRAFT'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."articles_status_enum"`);
    }

}
