import { Request, Response } from 'express';
import { UsersRepository } from '../repositories/UsersRepository'
import { Users } from '../entities/Users';;
import BaseController from './BaseController';

class UsersController extends BaseController<Users> {
  private usersRepository: UsersRepository;

  constructor() {
    const repository = new UsersRepository();
    super(repository);
    this.usersRepository = repository;
  }

 async findAll(req: Request, res: Response): Promise<Response> {
  try {
   const page = parseInt(req.query.page as string) || 1;
   const limit = parseInt(req.query.limit as string) || 10;
   const search = req.query.search as string;

   const result = await this.usersRepository.findAllPaginated({ page, limit, search });

   return res.status(200).json({ success: true, data: result });
  } catch (error) {
   console.error(error);
   return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
 }

 async findById(req: Request, res: Response): Promise<Response> {
  try {
   const { id } = req.params;
   const record = await this.usersRepository.findById(parseInt(id));

   if (!record) {
    return res.status(404).json({ success: false, message: 'Registro não encontrado' });
   }

   return res.status(200).json({ success: true, data: record });
  } catch (error) {
   console.error(error);
   return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
 }

 async create(req: Request, res: Response): Promise<Response> {
  try {
   const data = req.body;
   const record = await this.usersRepository.create(data);
   return res.status(201).json({ success: true, data: record });
  } catch (error) {
   console.error(error);
   return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
 }

 async update(req: Request, res: Response): Promise<Response> {
  try {
   const { id } = req.params;
   const data = req.body;
   
   const record = await this.usersRepository.update(parseInt(id), data);
   
   if (!record) {
    return res.status(404).json({ success: false, message: 'Registro não encontrado' });
   }

   return res.status(200).json({ success: true, data: record });
  } catch (error) {
   console.error(error);
   return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
 }

 async delete(req: Request, res: Response): Promise<Response> {
  try {
   const { id } = req.params;
   const success = await this.usersRepository.delete(parseInt(id));
   
   if (!success) {
    return res.status(404).json({ success: false, message: 'Registro não encontrado' });
   }

   return res.status(200).json({ success: true, data: { message: 'Registro deletado com sucesso' } });
  } catch (error) {
   console.error(error);
   return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
 }
}

export default UsersController;
