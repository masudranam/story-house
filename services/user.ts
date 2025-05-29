import  {userRepository} from '../repository/user.ts';
const UserRepository = new userRepository();
export class userService{
   async createUser(data: any){
    try{
      return await UserRepository.createUser(data);
    }catch(err){
      throw new Error(`Failed to create ${err}`);
    }
  }
  
   async getUserById(id: string){
    try{
      return await UserRepository.getUserById(id);
    }catch(err){
      throw new Error(`Not found user id ${id}`);
    }
  }

   async getAllUser(){
    try{
      return await UserRepository.getAllUsers();
    }catch(err){
      throw new Error(`User not found`);
    }
  }

     async updateUser(id: string, data: any){
    try{
      return await UserRepository.updateUserById(id, data);
    }catch(err){
      throw new Error(`User not found`);
    }
  }

    async deleteUser(id: string){
    try{
      return await UserRepository.deleteUserById(id);
    }catch(err){
      throw new Error(`User not found`);
    }
  }
}
