import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { Exclude } from 'class-transformer';
import { Brand } from '../../brands/entities/brand.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    @Exclude()
    password: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.BRAND,
    })
    role: Role;

    @ManyToOne(() => Brand, (brand) => brand.users, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'brandId' })
    brand: Brand;

    @Column({ nullable: true })
    brandId: number | null;

    @OneToMany(() => Brand, (brand) => brand.createdBy)
    createdBrands: Brand[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
