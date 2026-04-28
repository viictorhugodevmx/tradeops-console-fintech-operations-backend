import { Request, Response } from 'express';
import { UserModel } from './user.model';

export const getUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const users = await UserModel.find().select('-passwordHash').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};