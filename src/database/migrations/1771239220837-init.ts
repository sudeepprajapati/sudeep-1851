import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1771239220837 implements MigrationInterface {
    name = 'Init1771239220837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the enum type already exists in the database
        const typeExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'users_role_enum'
            ) as "exists"`);

        // Only create the enum type if it doesn't exist
        if (!typeExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'AUTHOR', 'BRAND', 'ADMIN', 'SUPERADMIN')`);
        }

        // Check if users table exists before creating
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'users'
            ) as "exists"`);

        if (!tableExists[0].exists) {
            await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
