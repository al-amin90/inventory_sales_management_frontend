export const dynamicTag = (_result: unknown, _err: unknown, arg: any) => {
  const url = typeof arg === "string" ? arg : arg.url;
  const tag = url.split("/").filter(Boolean)[0];
  return [{ type: tag as never }];
};
