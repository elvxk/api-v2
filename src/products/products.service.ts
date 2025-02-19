import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  async getProducts() {
    const res = await fetch('https://dummyjson.com/products');
    const data = await res.json();
    return data;
  }
}
