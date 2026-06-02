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
  public id!: string;
  public unit_id!: string;
  public tenant_id!: string;
  public message?: string;
  public status!: 'pending' | 'approved' | 'rejected';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
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
