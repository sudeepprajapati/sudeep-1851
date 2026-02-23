import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Column,
    Unique,
} from 'typeorm';
import { Brand } from '../../../modules/brands/entities/brand.entity';
import { User } from '../../../modules/users/entities/user.entity';

@Entity('brand_authors')
@Unique(['brandId', 'authorId'])

export class BrandAuthor {
    @PrimaryGeneratedColumn()
    id: number;

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
}