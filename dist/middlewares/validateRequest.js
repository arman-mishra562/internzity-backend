"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const validateRequest = (schemas) => {
    return (req, res, next) => {
        try {
            for (const key of Object.keys(schemas)) {
                const schema = schemas[key];
                if (!schema)
                    continue;
                const parseResult = schema.safeParse(req[key]);
                if (!parseResult.success) {
                    const errors = parseResult.error.flatten().fieldErrors;
                    // early exit with void return
                    res.status(400).json({ errors });
                    return;
                }
                // overwrite with parsed data
                req[key] = parseResult.data;
            }
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const errors = err.flatten().fieldErrors;
                res.status(400).json({ errors });
                return;
            }
            next(err);
        }
    };
};
exports.default = validateRequest;
