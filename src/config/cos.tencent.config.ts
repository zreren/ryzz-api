import { ConfigureRegister, TencentCloudCosConfig } from '@/modules/core/types';

export const cos: ConfigureRegister<TencentCloudCosConfig> = (configure) => ({
    appId: parseInt(configure.env('TENCENT_CLOUD_APP_ID'), 10),
    secretId: configure.env('TENCENT_CLOUD_COS_SECRET_ID', 'xx'),
    secretKey: configure.env('TENCENT_CLOUD_COS_SECRET_KEY', 'xx'),
    bucket: configure.env('TENCENT_CLOUD_COS_BUCKET', 'xx'),
    publicBucket: configure.env('TENCENT_CLOUD_COS_BUCKET_PUBLIC', 'xx'),
    region: configure.env('TENCENT_CLOUD_COS_REGION', 'xx'),
    durationSeconds: parseInt(configure.env('TENCENT_CLOUD_COS_DURATION_SECONDS', '86400'), 10),
    domain: configure.env('TENCENT_CLOUD_COS_BUCKET', 'xx')
});
