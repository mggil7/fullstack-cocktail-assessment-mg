import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cocktails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'glasstype', type: 'text', nullable: true })
  glassType: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;
}
