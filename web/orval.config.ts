import { defineConfig } from 'orval';

export default defineConfig({
    revisit: {
        output: {
            mode: 'tags-split',
            target: 'src/api/generated/revisit.ts',
            schemas: 'src/api/generated/model',
            client: 'react-query',
            mock: false,
        },
        input: {
            target: './openapi.json',
        },
    },
});
