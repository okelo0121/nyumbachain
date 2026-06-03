import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.config';

export interface PropertyAttributes {
  id?: string;
  landlord_id: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  property_type: 'apartment' | 'house' | 'studio' | 'bedsitter';
  amenities?: string[];
  photos?: string[];
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class Property extends Model<PropertyAttributes> implements PropertyAttributes {
  declare id: string;
  declare landlord_id: string;
  declare title: string;
  declare description?: string;
  declare address: string;
  declare city: string;
  declare latitude: number;
  declare longitude: number;
  declare property_type: 'apartment' | 'house' | 'studio' | 'bedsitter';
  declare amenities?: string[];
  declare photos?: string[];
  declare is_active: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Property.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    landlord_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('latitude');
        return rawValue ? parseFloat(rawValue as unknown as string) : 0;
      },
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('longitude');
        return rawValue ? parseFloat(rawValue as unknown as string) : 0;
      },
    },
    property_type: {
      type: DataTypes.ENUM('apartment', 'house', 'studio', 'bedsitter'),
      allowNull: false,
    },
    amenities: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    photos: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'properties',
    underscored: true,
    timestamps: true,
  }
);
