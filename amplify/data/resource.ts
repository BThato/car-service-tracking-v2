import { defineData, a, type ClientSchema } from '@aws-amplify/backend';
import { stageValidator } from '../functions/stage-validator/resource';
import { pushNotifier } from '../functions/push-notifier/resource';

const schema = a.schema({

  // ========== USER ==========
  User: a.model({
    cognitoId: a.string().required(),
    email: a.email().required(),
    firstName: a.string().required(),
    lastName: a.string().required(),
    phone: a.phone(),
    role: a.enum(['customer', 'engineer', 'admin']),
    pushToken: a.string(),
    isActive: a.boolean().default(true),
    vehicles: a.hasMany('Vehicle', 'ownerId'),
    bookings: a.hasMany('Booking', 'customerId'),
  })
    .authorization((allow) => [
      allow.ownerDefinedIn('cognitoId'),
      allow.groups(['admin']).to(['read', 'create', 'update', 'delete']),
      allow.groups(['engineer']).to(['read']),
    ]),

  // ========== VEHICLE ==========
  Vehicle: a.model({
    ownerId: a.id(),
    vehicleOwner: a.belongsTo('User', 'ownerId'),
    make: a.string().required(),
    model: a.string().required(),
    year: a.integer().required(),
    licensePlate: a.string().required(),
    vin: a.string(),
    color: a.string(),
    mileage: a.integer(),
  })
    .authorization((allow) => [
      allow.ownerDefinedIn('ownerId'),
      allow.groups(['admin', 'engineer']).to(['read']),
    ]),

  // ========== BOOKING ==========
  Booking: a.model({
    customerId: a.id(),
    customer: a.belongsTo('User', 'customerId'),
    vehicleId: a.id().required(),
    serviceType: a.enum([
      'oil_change', 'brake_service', 'tire_rotation', 'engine_repair',
      'transmission', 'electrical', 'body_work', 'full_service',
      'inspection', 'other',
    ]),
    description: a.string(),
    preferredDate: a.date().required(),
    preferredTime: a.string(),
    status: a.enum(['pending', 'confirmed', 'cancelled', 'completed']),
    cancellationReason: a.string(),
    serviceOrder: a.hasOne('ServiceOrder', 'bookingId'),
  })
    .authorization((allow) => [
      allow.authenticated(),
    ]),

  // ========== SERVICE ORDER ==========
  ServiceOrder: a.model({
    bookingId: a.id().required(),
    booking: a.belongsTo('Booking', 'bookingId'),
    assignedEngineerId: a.id(),
    currentStage: a.string().required().default('queued'),
    priority: a.enum(['low', 'normal', 'high', 'urgent']),
    notes: a.string(),
    startedAt: a.datetime(),
    completedAt: a.datetime(),
    stageUpdates: a.hasMany('StageUpdate', 'serviceOrderId'),
  })
    .authorization((allow) => [
      allow.authenticated(),
    ]),

  // ========== STAGE UPDATE ==========
  StageUpdate: a.model({
    serviceOrderId: a.id().required(),
    serviceOrder: a.belongsTo('ServiceOrder', 'serviceOrderId'),
    updatedById: a.id().required(),
    fromStage: a.string(),
    toStage: a.string().required(),
    notes: a.string(),
  })
    .authorization((allow) => [
      allow.authenticated(),
    ]),

  // ========== NOTIFICATION ==========
  Notification: a.model({
    userId: a.id(),
    serviceOrderId: a.id(),
    type: a.string().required(),
    title: a.string().required(),
    message: a.string().required(),
    channel: a.enum(['in_app', 'email', 'sms', 'push']),
    isRead: a.boolean().default(false),
  })
    .authorization((allow) => [
      allow.ownerDefinedIn('userId'),
      allow.groups(['admin']).to(['read', 'create']),
    ]),

  // ========== CUSTOM MUTATIONS ==========

  // Advance stage with validation (uses Lambda)
  advanceStage: a.mutation()
    .arguments({
      serviceOrderId: a.string().required(),
      notes: a.string(),
    })
    .returns(a.ref('ServiceOrder'))
    .authorization((allow) => [allow.groups(['admin', 'engineer'])])
    .handler(a.handler.function(stageValidator)),

  // Send push notification (uses Lambda)
  sendNotification: a.mutation()
    .arguments({
      userId: a.string().required(),
      title: a.string().required(),
      message: a.string().required(),
      serviceOrderId: a.string(),
    })
    .returns(a.ref('Notification'))
    .authorization((allow) => [allow.groups(['admin', 'engineer'])])
    .handler(a.handler.function(pushNotifier)),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
