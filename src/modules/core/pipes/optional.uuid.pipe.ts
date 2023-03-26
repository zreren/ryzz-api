import { ArgumentMetadata, ParseUUIDPipe } from '@nestjs/common';
import { isNil } from 'lodash';
/**
 * 验证url中的param参数是可选的UUID
 */
export class OptionalUUIDPipe extends ParseUUIDPipe {
    async transform(value?: string, metadata?: ArgumentMetadata) {
        if (isNil(value) || value.length === 0) return value;
        return super.transform(value, metadata);
    }
}
