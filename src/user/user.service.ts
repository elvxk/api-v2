import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async getUsers(): Promise<any> {
    const response = await fetch('https://dummyjson.com/users');
    const data = await response.json();
    return data;
  }
}
