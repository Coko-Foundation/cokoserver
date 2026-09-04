type ImageMetadata = {
  density: number
  height: number
  space: string
  width: number
}

export type StoredObject = {
  extension: string
  imageMetadata?: ImageMetadata
  key: string
  mimetype: string | false
  size: number
  type: string
}

type StoredObjectWithoutKey = Omit<StoredObject, 'key'>

type GeneratedVersionExtraProperties = {
  filename: string
  path: string
}

export type GeneratedVersion = StoredObjectWithoutKey &
  GeneratedVersionExtraProperties

export type FileStorageUploadOptions = {
  forceObjectKeyValue?: string
  public?: boolean
}

export type FileStorageGetUrlOptions = {
  expiresIn?: number
}
