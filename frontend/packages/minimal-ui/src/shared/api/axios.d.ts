import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** When true, the api client will not show a global error toast for this request */
    skipGlobalErrorToast?: boolean;
  }
}
