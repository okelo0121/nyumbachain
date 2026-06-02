import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.config';

export interface TenancyAttributes {
  id?: string;
  unit_id: string;
  tenant_id: string;
  landlord_id: string;
  start_date: Date;
  end_date?: Date;
  payment_day: number;
  monthly_rent_usdc: number;
  deposit_usdc: number;
  escrow_contract_id?: string;
  escrow_wallet_address?: string;
  status?: 'active' | 'ending' | 'ended' | 'disputed';
  created_at?: Date;
  updated_at?: Date;
}

export class Tenancy extends Model<TenancyAttributes> implements TenancyAttributes {
  public id!: string;
  public unit_id!: string;
  public tenant_id!: string;
  public landlord_id!: string;
  public start_date!: Date;
  public end_date?: Date;
  public payment_day!: number;
  public monthly_rent_usdc!: number;
  public deposit_usdc!: number;
  public escrow_contract_id?: string;
  public escrow_wallet_address?: string;
  public status!: 'active' | 'ending' | 'ended' | 'disputed';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Tenancy.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    unit_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    landlord_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    payment_day: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 28,
      },
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
    escrow_contract_id: {
      type: DataTypes.STRING(56),
      allowNull: true,
    },
    escrow_wallet_address: {
      type: DataTypes.STRING(56),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'ending', 'ended', 'disputed'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'tenancies',
    underscored: true,
    timestamps: true,
  }
);
