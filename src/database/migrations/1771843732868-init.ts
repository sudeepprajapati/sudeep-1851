import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1771843732868 implements MigrationInterface {
    name = 'Init1771843732868'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "brand_authors" ("id" SERIAL NOT NULL, "brandId" integer NOT NULL, "authorId" uuid NOT NULL, CONSTRAINT "UQ_ce62157e00dd93e0643567f0abc" UNIQUE ("brandId", "authorId"), CONSTRAINT "PK_f9545cf3809a08ad90efa1e2ee5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "articles" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "brandId" integer NOT NULL, "authorId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ADD CONSTRAINT "FK_3b2b1c2c1ce81ece5a239c1bfba" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ADD CONSTRAINT "FK_0808932182db805ab7714e15013" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_e6e39d09da997d0a04fac70bc0c" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_e6e39d09da997d0a04fac70bc0c"`);
        await queryRunner.query(`ALTER TABLE "brand_authors" DROP CONSTRAINT "FK_0808932182db805ab7714e15013"`);
        await queryRunner.query(`ALTER TABLE "brand_authors" DROP CONSTRAINT "FK_3b2b1c2c1ce81ece5a239c1bfba"`);
        await queryRunner.query(`DROP TABLE "articles"`);
        await queryRunner.query(`DROP TABLE "brand_authors"`);
    }

}
