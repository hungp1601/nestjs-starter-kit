import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor<any>();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});
