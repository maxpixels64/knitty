export interface IBaseHandler {
  fileExtensions: string[];

  parse(code: string): {
    frontmatter: Record<string, any>;
    compiledCode: string;
  };
}

export interface IKnittyConfig {
  handlers: IBaseHandler[];
  publicFolder: string;
  outputDirectory: string;
}

export const defineConfig = (config: IKnittyConfig) => config;
