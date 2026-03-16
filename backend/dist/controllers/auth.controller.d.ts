import type { Request, Response } from "express";
export declare const Signup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const Signin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const Logout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMe: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map