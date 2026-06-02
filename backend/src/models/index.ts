import { User } from './user.model';
import { Property } from './property.model';
import { Unit } from './unit.model';
import { Application } from './application.model';
import { Tenancy } from './tenancy.model';
import { Payment } from './payment.model';

// Associations

// User <-> Property
User.hasMany(Property, { foreignKey: 'landlord_id', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlord' });

// Property <-> Unit
Property.hasMany(Unit, { foreignKey: 'property_id', as: 'units', onDelete: 'CASCADE' });
Unit.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// Unit <-> Application
Unit.hasMany(Application, { foreignKey: 'unit_id', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

// User <-> Application (Tenant)
User.hasMany(Application, { foreignKey: 'tenant_id', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });

// Unit <-> Tenancy
Unit.hasMany(Tenancy, { foreignKey: 'unit_id', as: 'tenancies' });
Tenancy.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

// User <-> Tenancy (Tenant)
User.hasMany(Tenancy, { foreignKey: 'tenant_id', as: 'tenantTenancies' });
Tenancy.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });

// User <-> Tenancy (Landlord)
User.hasMany(Tenancy, { foreignKey: 'landlord_id', as: 'landlordTenancies' });
Tenancy.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlord' });

// Tenancy <-> Payment
Tenancy.hasMany(Payment, { foreignKey: 'tenancy_id', as: 'payments', onDelete: 'CASCADE' });
Payment.belongsTo(Tenancy, { foreignKey: 'tenancy_id', as: 'tenancy' });

export {
  User,
  Property,
  Unit,
  Application,
  Tenancy,
  Payment
};
