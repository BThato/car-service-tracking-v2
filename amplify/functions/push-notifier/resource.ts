import { defineFunction } from '@aws-amplify/backend';

export const pushNotifier = defineFunction({
  name: 'push-notifier',
  entry: './handler.ts',
  resourceGroupName: 'data',
});
