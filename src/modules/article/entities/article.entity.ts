import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { User } from '../../users/entities/user.entity';

@Entity('articles')
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @ManyToOne(() => Brand, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'brandId' })
    brand: Brand;

    @Column()
    brandId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'authorId' })
    author: User;

    @Column()
    authorId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}