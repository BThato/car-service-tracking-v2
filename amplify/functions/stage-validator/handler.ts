import type { AppSyncResolverHandler } from 'aws-lambda';

// Service-type-specific stage workflows
const SERVICE_STAGES: Record<string, string[]> = {
  oil_change: ['queued', 'vehicle_inspection', 'draining_old_oil', 'filter_replacement', 'new_oil_fill', 'quality_check', 'completed'],
  brake_service: ['queued', 'wheel_removal', 'brake_inspection', 'pad_rotor_replacement', 'brake_fluid_check', 'reassembly', 'brake_test', 'completed'],
  tire_rotation: ['queued', 'vehicle_lift', 'tire_inspection', 'rotation', 'pressure_check', 'completed'],
  engine_repair: ['queued', 'diagnostics', 'disassembly', 'parts_ordering', 'repair', 'reassembly', 'testing', 'quality_check', 'completed'],
  transmission: ['queued', 'diagnostics', 'fluid_drain', 'disassembly', 'repair_replacement', 'reassembly', 'fluid_refill', 'road_test', 'completed'],
  electrical: ['queued', 'diagnostics', 'wiring_inspection', 'component_repair', 'testing', 'completed'],
  body_work: ['queued', 'washing_degreasing', 'disassembly_masking', 'sanding_stripping', 'body_repair_filling', 'priming_sealing', 'painting', 'clear_coat_polish', 'reassembly', 'quality_check', 'completed'],
  full_service: ['queued', 'vehicle_inspection', 'oil_filter_change', 'fluid_topup', 'brake_check', 'tire_check', 'electrical_check', 'road_test', 'quality_check', 'completed'],
  inspection: ['queued', 'exterior_inspection', 'interior_inspection', 'mechanical_inspection', 'report_generation', 'completed'],
  other: ['queued', 'assessment', 'in_progress', 'quality_check', 'completed'],
};

function getNextStage(serviceType: string, currentStage: string): string | null {
  const stages = SERVICE_STAGES[serviceType] || SERVICE_STAGES.other;
  const idx = stages.indexOf(currentStage);
  if (idx === -1 || idx >= stages.length - 1) return null;
  return stages[idx + 1];
}

export const handler: AppSyncResolverHandler<
  { serviceOrderId: string; notes?: string },
  any
> = async (event) => {
  const { serviceOrderId, notes } = event.arguments;
  const userId = event.identity && 'sub' in event.identity ? event.identity.sub : 'unknown';

  // Dynamic import to avoid esbuild bundling issues
  const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
  const { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } = await import('@aws-sdk/lib-dynamodb');

  const ddbClient = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(ddbClient);

  const serviceOrderTable = process.env.SERVICEORDER_TABLE_NAME!;
  const bookingTable = process.env.BOOKING_TABLE_NAME!;
  const stageUpdateTable = process.env.STAGEUPDATE_TABLE_NAME!;

  // 1. Fetch the service order
  const orderResult = await docClient.send(new GetCommand({
    TableName: serviceOrderTable,
    Key: { id: serviceOrderId },
  }));

  if (!orderResult.Item) {
    throw new Error(`Service order ${serviceOrderId} not found`);
  }

  const order = orderResult.Item;
  const currentStage = order.currentStage;

  // 2. Get the booking to determine service type
  const bookingResult = await docClient.send(new GetCommand({
    TableName: bookingTable,
    Key: { id: order.bookingId },
  }));

  const serviceType = bookingResult.Item?.serviceType || 'other';

  // 3. Validate and get next stage
  const nextStage = getNextStage(serviceType, currentStage);
  if (!nextStage) {
    throw new Error(`Cannot advance from stage "${currentStage}" for service type "${serviceType}"`);
  }

  const now = new Date().toISOString();

  // 4. Update the service order
  let updateExpression = 'SET currentStage = :nextStage, updatedAt = :now';
  const expressionValues: Record<string, any> = {
    ':nextStage': nextStage,
    ':now': now,
  };

  if (nextStage === 'completed') {
    updateExpression += ', completedAt = :completedAt';
    expressionValues[':completedAt'] = now;
  }

  if (currentStage === 'queued') {
    updateExpression += ', startedAt = :startedAt';
    expressionValues[':startedAt'] = now;
  }

  const updateResult = await docClient.send(new UpdateCommand({
    TableName: serviceOrderTable,
    Key: { id: serviceOrderId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionValues,
    ReturnValues: 'ALL_NEW',
  }));

  // 5. Create a stage update record
  const stageUpdateId = `${serviceOrderId}-${Date.now()}`;
  await docClient.send(new PutCommand({
    TableName: stageUpdateTable,
    Item: {
      id: stageUpdateId,
      serviceOrderId,
      updatedById: userId,
      fromStage: currentStage,
      toStage: nextStage,
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
      __typename: 'StageUpdate',
    },
  }));

  // 6. Return the updated service order
  return updateResult.Attributes;
};

// trigger rebuild
