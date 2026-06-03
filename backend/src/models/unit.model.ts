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
  bathrooms?: number;
  created_at?: Date;
  updated_at?: Date;
}

export class Unit extends Model<UnitAttributes> implements UnitAttributes {
  declare id: string;
  declare property_id: string;
  declare unit_type: 'studio' | 'bedsitter' | '1bed' | '2bed' | '3bed';
  declare monthly_rent_usdc: number;
  declare deposit_usdc: number;
  declare is_available: boolean;
  declare floor_number?: number;
  declare square_meters?: number;
  declare bathrooms?: number;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
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
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'units',
    underscored: true,
    timestamps: true,
  }
);
