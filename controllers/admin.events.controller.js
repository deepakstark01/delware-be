import Event from '../models/Event.js';
import Booking from '../models/Booking.js';

export const listEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .select('-image.data') // Exclude image data for list view
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ startsAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .select('-image.data') // Exclude image data
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found',
        details: 'Event with specified ID does not exist'
      });
    }

    res.json({ event });
  } catch (error) {
    next(error);
  }
};

// controllers/admin.events.controller.js - Updated getEventImage function

export const getEventImage = async (req, res, next) => {
  try {
    console.log('Fetching image for event ID:', req.params.id); // Debug log
    
    const event = await Event.findById(req.params.id).select('image');
    
    if (!event) {
      console.log('Event not found for ID:', req.params.id);
      return res.status(404).json({
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found',
        details: 'Event with specified ID does not exist'
      });
    }

    if (!event.image || !event.image.data) {
      console.log('No image data found for event:', req.params.id);
      return res.status(404).json({
        code: 'IMAGE_NOT_FOUND',
        message: 'Event image not found',
        details: 'No image found for this event'
      });
    }

    console.log('Image found, sending response:', {
      contentType: event.image.contentType,
      size: event.image.size,
      filename: event.image.filename
    });

    // Set proper headers for image response
    res.set({
      'Content-Type': event.image.contentType || 'image/jpeg',
      'Content-Length': event.image.size,
      'Content-Disposition': `inline; filename="${event.image.filename || 'event-image'}"`,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*', // Allow CORS for images
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Send the binary image data
    res.send(event.image.data);
  } catch (error) {
    console.error('Error in getEventImage:', error);
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, location, startsAt, endsAt } = req.body;
    console.log(req.body);

    const eventData = {
      title,
      description,
      location,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      createdBy: req.user._id
    };

    // Handle image upload if present
    if (req.file) {
      eventData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname,
        size: req.file.size
      };
    }

    const event = new Event(eventData);
    await event.save();

    // Return event without image data
    const createdEvent = await Event.findById(event._id)
      .select('-image.data')
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({ event: createdEvent });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { title, description, location, startsAt, endsAt } = req.body;

    const updates = {
      updatedBy: req.user._id
    };

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    if (startsAt !== undefined) updates.startsAt = new Date(startsAt);
    if (endsAt !== undefined) updates.endsAt = new Date(endsAt);

    // Handle image upload if present
    if (req.file) {
      updates.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname,
        size: req.file.size
      };
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .select('-image.data')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found',
        details: 'Event with specified ID does not exist'
      });
    }

    res.json({ event });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found',
        details: 'Event with specified ID does not exist'
      });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};
 
  export const bookEvent = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { numberOfTickets, attendeeDetails } = req.body;
      const userId = req.user._id;

      // Validate event ID and existence
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Create booking
      const booking = await Booking.create({
        event: id,
        user: userId,
        numberOfTickets,
        attendeeDetails
      });

      res.status(201).json({ message: 'Booking successful', booking });
    } catch (error) {
      next(error);
    }
  };

  // Get booking history for authenticated user
  export const getMyBookings = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const bookings = await Booking.find({ user: userId })
        .populate('event')
        .sort({ createdAt: -1 });
      res.json({ bookings });
    } catch (error) {
      next(error);
    }
  };
