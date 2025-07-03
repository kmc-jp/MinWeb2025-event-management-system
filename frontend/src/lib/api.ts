import { DefaultApi, Configuration } from '../generated';

// APIクライアントの設定
const configuration = new Configuration({
  basePath: typeof window !== 'undefined' 
    ? window.location.origin.replace('3000', '8080') 
    : 'http://localhost:8080',
});

// APIクライアントのインスタンスを作成
export const apiClient = new DefaultApi(configuration);

// エラーハンドリング用のヘルパー関数
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return '予期しないエラーが発生しました';
}; 