import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type SchemaKey = 'body' | 'query' | 'params';

export default (schema: Record<SchemaKey, ZodSchema<any>>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // For each key in schema (e.g. body, query), run parse
      for (const key of Object.keys(schema) as SchemaKey[]) {
        const result = schema[key].safeParse(req[key]);
        if (!result.success) {
          const errors = result.error.flatten().fieldErrors;
          return res.status(400).json({ errors });
        }
        // overwrite with parsed data
        req[key] = result.data;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ errors: err.flatten().fieldErrors });
      }
      next(err);
    }
  };
};
