import { DateEntity } from '@shared/entity/date.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StatusEnum } from '../model/enum';
@Entity('STEPUP_SESSION')
export class StepupSessionEntity extends DateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  action_type: string;

  @Column('long')
  token: string;

  @Column('varchar', { default: StatusEnum.Active })
  status: StatusEnum;

  @Column('varchar')
  customer: string;
}
