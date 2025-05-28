import  {userRepository} from '../repository/user.ts';

export class userService{
  static async createUser(data: any){
    try{
      return await userRepository.createUser(data);
    }catch(err){
      throw new Error(`Failed to create ${err}`);
    }
  }
  
  static async getUserById(id: string){
    try{
      return await userRepository.getUserById(id);
    }catch(err){
      throw new Error(`Not found user id ${id}`);
    }
  }

  static async getAllUser(){
    try{
      return await userRepository.getAllUsers();
    }catch(err){
      throw new Error(`User not found`);
    }
  }

    static async updateUser(id: string, data: any){
    try{
      return await userRepository.updateUserById(id, data);
    }catch(err){
      throw new Error(`User not found`);
    }
  }

    static async deleteUser(id: string){
    try{
      return await userRepository.deleteUserById(id);
    }catch(err){
      throw new Error(`User not found`);
    }
  }
}
