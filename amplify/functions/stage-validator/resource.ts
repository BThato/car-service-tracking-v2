import { defineFunction } from '@aws-amplify/backend';

export const stageValidator = defineFunction({
  name: 'stage-validator',
  entry: './handler.ts',
});
