import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
  AllowNull,
} from 'sequelize-typescript';

import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

@Table({
  tableName: 'products',
})
export class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    validate: {
      notEmpty: true,
    },
  })
  declare productToken: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(10, 2),
    get() {
      const value = this.getDataValue('price') as string;
      return value != null ? parseFloat(value) : value;
    },
  })
  declare price: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare stock: number;
}
