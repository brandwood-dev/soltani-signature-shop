declare module "meta-capi-param-builder-clientjs" {
  export type MetaCollectedParameters = {
    _fbc?: string;
    _fbp?: string;
    _fbi?: string;
  };

  export type MetaClientParamBuilder = {
    processAndCollectAllParams(
      url?: string | null,
      getIpFn?: () => string | Promise<string>,
    ): Promise<MetaCollectedParameters>;
    getFbc(): string;
    getFbp(): string;
    getClientIpAddress(): string;
  };

  const clientParamBuilder: MetaClientParamBuilder;
  export default clientParamBuilder;
}
