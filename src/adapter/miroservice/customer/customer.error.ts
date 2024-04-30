export const ER_GET_CUSTOMER = (cifId: any) => ({
  errorCode: 'CUST-0003',
  message: `Customer ${cifId} does not exist!`,
});
