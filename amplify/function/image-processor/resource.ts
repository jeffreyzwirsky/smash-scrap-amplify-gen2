import { defineFunction } from '@aws-amplify/backend'

export const imageProcessor = defineFunction({
  name: 'image-processor',
  entry: './handler.ts',
  timeoutSeconds: 300,
  memoryMB: 1024,
  environment: {
    MAX_IMAGE_SIZE_MB: '5',
    MAX_DIMENSION_PX: '2560',
    THUMBNAIL_SIZE_PX: '800',
  },
})
