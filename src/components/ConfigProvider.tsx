import log from "loglevel";
import { Context, createContext, useContext, useEffect, useState } from "react";
import { Config } from "../config";

export type ConfigLoaderFunction = () => Promise<Config>;

export const ConfigContext: Context<Config> = createContext<Config>(null as any);

type ConfigProviderProps = {
  /**
   * Property that represents the config object
   */
  config?: Config;
  /**
   * Property that represents the React Children nodes
   */
  children: React.ReactNode;
  /**
   * Property that represents a function that enables to resolve config loading in Async Way
   */
  getConfig?: ConfigLoaderFunction;
};

const ConfigProvider = ({ children, config, getConfig }: ConfigProviderProps) => {
  const [configuration, setConfiguration] = useState<Config>(config as Config);
  useEffect(() => {
    if (getConfig) {
      getConfig()
        .then((config: Config) => {
          log.debug(`[ConfigProvider]: Config loaded: ${config}`);

          setConfiguration(config);
        })
        .catch((error: Error) => {
          log.debug(`[ConfigProvider]: Failed to load config: ${error}`);
        });
    }
  }, [getConfig]);
  return <ConfigContext.Provider value={configuration}>{children}</ConfigContext.Provider>;
};

export function useConfig(): Config {
  const config = useContext(ConfigContext);
  if (!config) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return config;
}

export default ConfigProvider;
