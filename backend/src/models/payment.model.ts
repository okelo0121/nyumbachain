import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.config';

export interface PaymentAttributes {
  id?: string;
  tenancy_id: string;
  amount_usdc: number;
  payment_type: 'rent' | 'deposit' | 'deposit_return' | 'penalty';
  status: 'pending' | 'executed' | 'failed';
  stellar_tx_hash?: string;
  due_date: Date;
  executed_at?: Date;
  failure_reason?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class Payment extends Model<PaymentAttributes> implements PaymentAttributes {
  declare id: string;
  declare tenancy_id: string;
  declare amount_usdc: number;
  declare payment_type: 'rent' | 'deposit' | 'deposit_return' | 'penalty';
  declare status: 'pending' | 'executed' | 'failed';
  declare stellar_tx_hash?: string;
  declare due_date: Date;
  declare executed_at?: Date;
  declare failure_reason?: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenancy_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount_usdc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('amount_usdc');
        return value ? parseFloat(value as unknown as string) : 0;
      },
    },
    payment_type: {
      type: DataTypes.ENUM('rent', 'deposit', 'deposit_return', 'penalty'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'executed', 'failed'),
      defaultValue: 'pending',
    },
    stellar_tx_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    executed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failure_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'payments',
    underscored: true,
    timestamps: true,
  }
);
