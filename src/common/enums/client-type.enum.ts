export enum ClientTypeEnum {
  Web = 'web',
  Mobile = 'mobile',
}

export const isClientTypeEnum = (value: any): value is ClientTypeEnum => {
  return (
    Object.values(ClientTypeEnum).findIndex(
      (clientType) => clientType === value,
    ) !== -1
  );
};
