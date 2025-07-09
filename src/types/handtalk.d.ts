interface HandtalkOptions {
  token: string;
  align?: 'left' | 'right';
  mobileBehavior?: 'draggable' | 'fixed';
  ytEmbedReplace?: boolean;
  [key: string]: any;
}

declare global {
  interface Window {
    HT: {
      new (options: HandtalkOptions): any;
    };
    ht: any;
  }
}

export {}; 