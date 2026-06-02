import { Response } from 'express';
import { z } from 'zod';
import { Property, Unit, User } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { geocodeAddress } from '../utils/geocoder';
import { sequelize } from '../config/db.config';
import { Op } from 'sequelize';

// Validation Schemas
export const createPropertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
  city: z.string().min(2, 'City must be at least 2 characters long'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  property_type: z.enum(['apartment', 'house', 'studio', 'bedsitter']),
  amenities: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const createUnitSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  unit_type: z.enum(['studio', 'bedsitter', '1bed', '2bed', '3bed']),
  monthly_rent_usdc: z.number().positive('Rent must be a positive number'),
  deposit_usdc: z.number().positive('Deposit must be a positive number'),
  floor_number: z.number().int().optional(),
  square_meters: z.number().positive().optional(),
});

export const updateUnitSchema = createUnitSchema.omit({ property_id: true }).partial().extend({
  is_available: z.boolean().optional(),
});

// Controllers
export const createProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'landlord') {
      return res.status(403).json({ error: 'Only landlords can list properties.' });
    }

    const { title, description, address, city, property_type, amenities, photos } = req.body;
    let { latitude, longitude } = req.body;

    // Call geocoding if coords are missing
    if (latitude === undefined || longitude === undefined) {
      const coords = await geocodeAddress(address, city);
      latitude = coords.latitude;
      longitude = coords.longitude;
    }

    const property = await Property.create({
      landlord_id: req.user.id,
      title,
      description,
      address,
      city,
      latitude,
      longitude,
      property_type,
      amenities: amenities || [],
      photos: photos || [],
      is_active: true,
    });

    return res.status(201).json(property);
  } catch (error) {
    console.error('Create property error:', error);
    return res.status(500).json({ error: 'Server error during property creation.' });
  }
};

export const getPropertyDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const property = await Property.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: Unit,
          as: 'units',
        },
        {
          model: User,
          as: 'landlord',
          attributes: ['id', 'full_name', 'email', 'phone', 'stellar_wallet', 'kyc_verified'],
        },
      ],
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    return res.json(property);
  } catch (error) {
    console.error('Get property details error:', error);
    return res.status(500).json({ error: 'Server error retrieving property details.' });
  }
};

export const updateProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    if (property.landlord_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this property.' });
    }

    const updateData = req.body;
    
    // Geocode if address or city is updated but lat/lng is not provided
    if ((updateData.address || updateData.city) && (updateData.latitude === undefined || updateData.longitude === undefined)) {
      const address = updateData.address || property.address;
      const city = updateData.city || property.city;
      const coords = await geocodeAddress(address, city);
      updateData.latitude = coords.latitude;
      updateData.longitude = coords.longitude;
    }

    await property.update(updateData);
    return res.json(property);
  } catch (error) {
    console.error('Update property error:', error);
    return res.status(500).json({ error: 'Server error updating property.' });
  }
};

export const deleteProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    if (property.landlord_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this property.' });
    }

    // Soft delete
    await property.update({ is_active: false });
    return res.json({ message: 'Property deleted successfully.' });
  } catch (error) {
    console.error('Delete property error:', error);
    return res.status(500).json({ error: 'Server error deleting property.' });
  }
};

export const searchProperties = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      city,
      lat,
      lng,
      radius, // in meters
      unit_type,
      min_rent,
      max_rent,
      amenities,
      available,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = { is_active: true };

    if (city) {
      whereClause[Op.or] = [
        { city: { [Op.iLike]: `%${city}%` } },
        { address: { [Op.iLike]: `%${city}%` } },
      ];
    }

    // Radius searching if lat, lng, and radius are provided
    if (lat && lng && radius) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const distanceLimit = parseFloat(radius as string);

      // Filter in SQL by calculating distance
      whereClause[Op.and] = sequelize.literal(`(
        6371000 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(${longitude})) + 
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      ) <= ${distanceLimit}`);
    }

    // Include Units for unit filters
    const unitWhere: any = {};
    if (unit_type) {
      const types = (unit_type as string).split(',');
      unitWhere.unit_type = { [Op.in]: types };
    }
    if (min_rent) {
      unitWhere.monthly_rent_usdc = { ...unitWhere.monthly_rent_usdc, [Op.gte]: parseFloat(min_rent as string) };
    }
    if (max_rent) {
      unitWhere.monthly_rent_usdc = { ...unitWhere.monthly_rent_usdc, [Op.lte]: parseFloat(max_rent as string) };
    }
    if (available === 'true') {
      unitWhere.is_available = true;
    }

    // Amenities query logic
    if (amenities) {
      const list = (amenities as string).split(',');
      // JSONB contains
      whereClause.amenities = {
        [Op.contains]: list,
      };
    }

    // Sorting
    let order: any = [['created_at', 'DESC']];
    if (sort === 'price_asc') {
      // Need sorting by associated units price
      order = [[{ model: Unit, as: 'units' }, 'monthly_rent_usdc', 'ASC']];
    } else if (sort === 'price_desc') {
      order = [[{ model: Unit, as: 'units' }, 'monthly_rent_usdc', 'DESC']];
    } else if (sort === 'nearest' && lat && lng) {
      // Sort by the calculated distance
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      order = [sequelize.literal(`(
        6371000 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(${longitude})) + 
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      ) ASC`)];
    }

    const { count, rows: properties } = await Property.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Unit,
          as: 'units',
          where: Object.keys(unitWhere).length > 0 ? unitWhere : undefined,
          required: Object.keys(unitWhere).length > 0, // Inner join if filtering units
        },
      ],
      order,
      limit: Number(limit),
      offset: Number(offset),
      distinct: true, // Prevents duplicate rows when matching units
    });

    return res.json({
      properties,
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / Number(limit)),
    });
  } catch (error) {
    console.error('Search properties error:', error);
    return res.status(500).json({ error: 'Server error searching properties.' });
  }
};

// Unit Management Controllers
export const addUnit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'landlord') {
      return res.status(403).json({ error: 'Only landlords can manage units.' });
    }

    const { property_id, unit_type, monthly_rent_usdc, deposit_usdc, floor_number, square_meters } = req.body;

    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    if (property.landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this property.' });
    }

    const unit = await Unit.create({
      property_id,
      unit_type,
      monthly_rent_usdc,
      deposit_usdc,
      floor_number,
      square_meters,
      is_available: true,
    });

    return res.status(201).json(unit);
  } catch (error) {
    console.error('Add unit error:', error);
    return res.status(500).json({ error: 'Server error adding unit.' });
  }
};

export const updateUnit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByPk(id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!unit) {
      return res.status(404).json({ error: 'Unit not found.' });
    }

    const property = unit.get('property') as Property;

    if (property.landlord_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this unit\'s property.' });
    }

    await unit.update(req.body);
    return res.json(unit);
  } catch (error) {
    console.error('Update unit error:', error);
    return res.status(500).json({ error: 'Server error updating unit.' });
  }
};
