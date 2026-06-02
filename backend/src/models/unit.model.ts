import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.config';

export interface UnitAttributes {
  id?: string;
  property_id: string;
  unit_type: 'studio' | 'bedsitter' | '1bed' | '2bed' | '3bed';
  monthly_rent_usdc: number;
  deposit_usdc: number;
  is_available?: boolean;
  floor_number?: number;
  square_meters?: number;
  created_at?: Date;
  updated_at?: Date;
}

export class Unit extends Model<UnitAttributes> implements UnitAttributes {
  public id!: string;
  public property_id!: string;
  public unit_type!: 'studio' | 'bedsitter' | '1bed' | '2bed' | '3bed';
  public monthly_rent_usdc!: number;
  public deposit_usdc!: number;
  public is_available!: boolean;
  public floor_number?: number;
  public square_meters?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Unit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    property_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    unit_type: {
      type: DataTypes.ENUM('studio', 'bedsitter', '1bed', '2bed', '3bed'),
      allowNull: false,
    },
    monthly_rent_usdc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('monthly_rent_usdc');
        return value ? parseFloat(value as unknown as string) : 0;
      },
    },
    deposit_usdc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('deposit_usdc');
        return value ? parseFloat(value as unknown as string) : 0;
      },
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    floor_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    square_meters: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      get() {
        const value = this.getDataValue('square_meters');
        return value ? parseFloat(value as unknown as string) : undefined;
      },
    },
  },
  {
    sequelize,
    tableName: 'units',
    underscored: true,
    timestamps: true,
  }
);
