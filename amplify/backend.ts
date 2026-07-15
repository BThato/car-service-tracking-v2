import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { stageValidator } from './functions/stage-validator/resource';
import { pushNotifier } from './functions/push-notifier/resource';

const backend = defineBackend({
  auth,
  data,
  stageValidator,
  pushNotifier,
});
