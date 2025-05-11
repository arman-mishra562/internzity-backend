import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';

type SchemaKey = 'body' | 'query' | 'params';

const validateRequest = (
  schemas: Partial<Record<SchemaKey, ZodSchema<any>>>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const key of Object.keys(schemas) as SchemaKey[]) {
        const schema = schemas[key];
        if (!schema) continue;

        const result = schema.safeParse(req[key as keyof Request]);
        if (!result.success) {
          const errors = result.error.flatten().fieldErrors;
          return res.status(400).json({ errors });
        }
        // Overwrite with the parsed data
        // @ts-expect-error — we know result.data matches schema
        req[key] = result.data;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.flatten().fieldErrors;
        return res.status(400).json({ errors });
      }
      next(err);
    }
  };
};

export default validateRequest;