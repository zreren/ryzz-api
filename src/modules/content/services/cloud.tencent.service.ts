import { App } from "@/modules/core/app";
import { TencentCloudCosConfig } from "@/modules/core/types";
import { UserEntity } from "@/modules/user/entities";
import { Injectable } from "@nestjs/common";
import * as tencentcloud from "tencentcloud-sdk-nodejs"

@Injectable()
export class TencentCloudService {
    async getFederationToken(user: UserEntity) {
        const cosConfig = await App.configure.get<TencentCloudCosConfig>('cos');
        return new tencentcloud.sts.v20180813.Client({
            credential: {
                secretId: cosConfig.secretId,
                secretKey: cosConfig.secretKey,
            },
            region: cosConfig.region,
        }).GetFederationToken({
            Name: 'test',
            Policy: encodeURIComponent(`{"version":"2.0","statement":[{"action":["name/cos:PutObject"],"effect":"allow","resource":["qcs::cos:${cosConfig.region}:uid/${cosConfig.appId}:${cosConfig.bucket}/community/${user.id.substring(0, 8)}*"]}]}`),
            DurationSeconds: cosConfig.durationSeconds,
        });
    }

    async getCredentialConfig() {
        const cosConfig = await App.configure.get<TencentCloudCosConfig>('cos');
        return {
            secretId: cosConfig.secretId,
            secretKey: cosConfig.secretKey,
        }
    }
}