import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class DateEntity {
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ default: null })
  created_by: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ default: null })
  updated_by: number;
}
