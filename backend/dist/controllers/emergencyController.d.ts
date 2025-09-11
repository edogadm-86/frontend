import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getEmergencyContacts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createEmergencyContact: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateEmergencyContact: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteEmergencyContact: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=emergencyController.d.ts.map