import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { stageValidator } from './functions/stage-validator/resource';
import { pushNotifier } from './functions/push-notifier/resource';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  stageValidator,
  pushNotifier,
});

// Get references to the DynamoDB tables created by the data resource
const serviceOrderTable = backend.data.resources.tables['ServiceOrder'];
const bookingTable = backend.data.resources.tables['Booking'];
const stageUpdateTable = backend.data.resources.tables['StageUpdate'];

// Grant the stage-validator Lambda access to read/write these tables
const stageValidatorLambda = backend.stageValidator.resources.lambda;

stageValidatorLambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'dynamodb:GetItem',
    'dynamodb:PutItem',
    'dynamodb:UpdateItem',
    'dynamodb:Query',
  ],
  resources: [
    serviceOrderTable.tableArn,
    bookingTable.tableArn,
    stageUpdateTable.tableArn,
  ],
}));

// Pass table names as environment variables to the Lambda
stageValidatorLambda.addEnvironment('SERVICEORDER_TABLE_NAME', serviceOrderTable.tableName);
stageValidatorLambda.addEnvironment('BOOKING_TABLE_NAME', bookingTable.tableName);
stageValidatorLambda.addEnvironment('STAGEUPDATE_TABLE_NAME', stageUpdateTable.tableName);
