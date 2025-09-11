import { Request, Response, NextFunction } from 'express';
export declare const validateRequest: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateUser: import("express-validator").ValidationChain[];
export declare const validateDog: import("express-validator").ValidationChain[];
export declare const validateVaccination: import("express-validator").ValidationChain[];
export declare const validateHealthRecord: import("express-validator").ValidationChain[];
export declare const validateAppointment: import("express-validator").ValidationChain[];
export declare const validateTrainingSession: import("express-validator").ValidationChain[];
export declare const validateEmergencyContact: import("express-validator").ValidationChain[];
export declare const validateNutritionRecord: import("express-validator").ValidationChain[];
export declare const validateMealPlan: import("express-validator").ValidationChain[];
//# sourceMappingURL=validation.d.ts.map