import { ModuleMetadata } from '@nestjs/common';

import { EventEmitterModule } from '@nestjs/event-emitter';

import { JwtService } from '@nestjs/jwt';

import { ModuleBuilder } from '../core/decorators';

import { DatabaseModule } from '../database/database.module';
import { addEntities, addSubscribers } from '../database/helpers';

import { FollowService, TokenService } from '../user/services';

import * as entities from './entities';
import * as listeners from './listeners';
import * as repositories from './repositories';
import { CategoryRepository, PostRepository } from './repositories';
import * as services from './services';
import { CategoryService } from './services';
import { PostService } from './services/post.service';
import { SearchService } from './services/search.service';
import { PostSubscriber } from './subscribers';
import { SearchType } from './types';

@ModuleBuilder(async (configure) => {
    const searchType = await configure.get<SearchType>('content.searchType', 'against');
    const providers: ModuleMetadata['providers'] = [
        ...Object.values(services),
        ...Object.values(listeners),
        ...(await addSubscribers(configure, [PostSubscriber])),
        {
            provide: PostService,
            inject: [
                PostRepository,
                CategoryRepository,
                CategoryService,
                TokenService,
                { token: SearchService, optional: true },
            ],
            useFactory(
                postRepository: PostRepository,
                categoryRepository: CategoryRepository,
                categoryService: CategoryService,
                tokenService: TokenService,
                searchService?: SearchService,
            ) {
                return new PostService(
                    postRepository,
                    categoryRepository,
                    categoryService,
                    tokenService,
                    searchService,
                    searchType,
                );
            },
        },
        FollowService,
        TokenService,
        JwtService,
    ];
    if (configure.has('elastic') && searchType === 'elastic') providers.push(SearchService);
    return {
        imports: [
            await addEntities(configure, Object.values(entities)),
            DatabaseModule.forRepository(Object.values(repositories)),
            EventEmitterModule.forRoot({
                // set this to `true` to use wildcards
                wildcard: true,
                // the delimiter used to segment namespaces
                delimiter: '.',
                // set this to `true` if you want to emit the newListener event
                newListener: false,
                // set this to `true` if you want to emit the removeListener event
                removeListener: false,
                // the maximum amount of listeners that can be assigned to an event
                maxListeners: 10,
                // show event name in memory leak message when more than maximum amount of listeners is assigned
                verboseMemoryLeak: false,
                // disable throwing uncaughtException if an error event is emitted and it has no listeners
                ignoreErrors: false,
            }),
        ],
        providers,
        exports: [
            ...Object.values(services),
            PostService,
            DatabaseModule.forRepository(Object.values(repositories)),
        ],
    };
})
export class ContentModule {}
