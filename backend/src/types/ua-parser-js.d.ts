declare module 'ua-parser-js' {
  interface IUAParser {
    getBrowser(): {
      name?: string;
      version?: string;
    };
    getOS(): {
      name?: string;
      version?: string;
    };
    getDevice(): {
      model?: string;
      type?: string;
      vendor?: string;
    };
    getEngine(): {
      name?: string;
      version?: string;
    };
    getCPU(): {
      architecture?: string;
    };
    getResult(): {
      ua: string;
      browser: {
        name?: string;
        version?: string;
      };
      engine: {
        name?: string;
        version?: string;
      };
      os: {
        name?: string;
        version?: string;
      };
      device: {
        model?: string;
        type?: string;
        vendor?: string;
      };
      cpu: {
        architecture?: string;
      };
    };
    setUA(ua: string): IUAParser;
  }

  interface UAParserConstructor {
    new(ua?: string): IUAParser;
    (ua?: string): IUAParser;
  }

  const UAParser: UAParserConstructor;
  export default UAParser;
} 