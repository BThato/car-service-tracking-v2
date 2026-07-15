import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    givenName: { required: true, mutable: true },
    familyName: { required: true, mutable: true },
    phoneNumber: { required: false, mutable: true },
    'custom:role': { dataType: 'String', mutable: true },
  },
  groups: ['admin', 'engineer', 'customer'],
});
