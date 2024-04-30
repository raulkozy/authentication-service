export const CUSTOMER_SERVICE_URL = () => process.env.CUSTOMER_SERVICE_URL;

export const DEVICE_STATUS_CHECK_API_URL = (customer_id, device_id) =>
  `${CUSTOMER_SERVICE_URL()}/device/device-status-check?customer_id=${customer_id}&device_id=${device_id}`;
