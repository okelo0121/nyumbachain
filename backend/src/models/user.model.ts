import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.config';

export interface UserAttributes {
  id?: string;
  email: string;
  password_hash: string;
  role: 'landlord' | 'tenant' | 'admin';
  full_name: string;
  phone?: string;
  stellar_wallet?: string;
  stellar_wallet_secret_encrypted?: string;
  kyc_verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password_hash: string;
  declare role: 'landlord' | 'tenant' | 'admin';
  declare full_name: string;
  declare phone?: string;
  declare stellar_wallet?: string;
  declare stellar_wallet_secret_encrypted?: string;
  declare kyc_verified: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('landlord', 'tenant', 'admin'),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    stellar_wallet: {
      type: DataTypes.STRING(56),
      allowNull: true,
    },
    stellar_wallet_secret_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kyc_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
    timestamps: true,
  }
);
