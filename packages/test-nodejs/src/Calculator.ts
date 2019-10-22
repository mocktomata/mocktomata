import { AxiosInstance } from 'axios'

export class Calculator {
  constructor(private axios: AxiosInstance) { }

  async add(a: number, b: number) {
    const response = await this.axios.get(`http://api.mathjs.org/v4/?expr=${a}%2B${b}`)
    return response.data
  }
}
