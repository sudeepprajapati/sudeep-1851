import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('brands')
export class Brand {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    logoUrl: string;

    @ManyToOne(() => User, (user) => user.createdBrands, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'createdBy' })
    createdBy: User;

    @OneToMany(() => User, (user) => user.brand)
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 