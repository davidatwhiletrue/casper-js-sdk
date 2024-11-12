import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class HttpConnection {
  private httpClient: AxiosInstance;
  public headers: Record<string, string>;
  public url: string;

  constructor(httpClient: AxiosInstance, sourceUrl: string) {
    this.httpClient = httpClient;
    this.url = sourceUrl;
    this.headers = {};
  }

  async request(lastEventID: number): Promise<AxiosResponse<any>> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: this.url,
      headers: {
        'Cache-Control': 'no-cache',
        'Accept': 'text/event-stream',
        'Connection': 'keep-alive',
        ...this.headers
      }
    };

    if (lastEventID >= 0) {
      config.params = {
        start_from: lastEventID
      };
    }

    try {
      const response = await this.httpClient.request(config);
      if (response.status !== 200) {
        throw new Error('error invalid connect response code');
      }
      return response;
    } catch (err) {
      throw err;
    }
  }
}
