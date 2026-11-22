import { ValueTransformer } from 'typeorm';

export const bigintTransformer: ValueTransformer = {
  to: (value: number | null | undefined): string | null | undefined => {
    if (value === null || value === undefined) return value;
    return value.toString();
  },
  from: (value: string | null | undefined): number | null | undefined => {
    if (value === null || value === undefined) return value;
    return parseInt(value, 10);
  },
};

export const decimalTransformer: ValueTransformer = {
  to: (value: number | null | undefined): string | null | undefined => {
    if (value === null || value === undefined) return value;
    return value.toString();
  },
  from: (value: string | null | undefined): number | null | undefined => {
    if (value === null || value === undefined) return value;
    return parseFloat(value);
  },
};
