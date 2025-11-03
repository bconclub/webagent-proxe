import { proxeConfig } from './proxe.config';
import { windchasersConfig } from './windchasers.config';
import type { BrandConfig } from './proxe.config';

export const brandConfigs: Record<string, BrandConfig> = {
  proxe: proxeConfig,
  windchasers: windchasersConfig,
};

export function getBrandConfig(brand: string): BrandConfig {
  return brandConfigs[brand.toLowerCase()] || proxeConfig;
}

export { proxeConfig, windchasersConfig };
export type { BrandConfig };

