import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getDogs: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createDog: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateDog: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteDog: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDogHealthStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=dogController.d.ts.map