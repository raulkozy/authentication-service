import { DateEntity } from '@adapter/miroservice/shared/entity/date.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('CUSTOMER_ADDRESS')
export class AddressEntity extends DateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  street: string;

  @Column({ nullable: true })
  address_line2: string;

  @Column({ length: 8 })
  country_code: string;

  @Column({ length: 16, nullable: true })
  state_code: string;

  @Column({ length: 16, nullable: true })
  city: string;

  @Column({ nullable: true })
  postal_code: number;
}
