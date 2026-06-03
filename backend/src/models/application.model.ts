import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.config';

export interface ApplicationAttributes {
  id?: string;
  unit_id: string;
  tenant_id: string;
  message?: string;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: Date;
  updated_at?: Date;
}

export class Application extends Model<ApplicationAttributes> implements ApplicationAttributes {
  declare id: string;
  declare unit_id: string;
  declare tenant_id: string;
  declare message?: string;
  declare status: 'pending' | 'approved' | 'rejected';
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Application.init(
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
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    tableName: 'applications',
    underscored: true,
    timestamps: true,
  }
);
