import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

interface StorageUploadParams {
  objectName: string;
  data: Buffer;
  mimeType: string;
}

interface StorageUploadResult {
  bucket: string;
  objectName: string;
  etag: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: Client;
  private readonly bucket: string;
  private readonly defaultPresignedExpirySeconds: number;
  private readonly publicUrl?: URL;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.mustGetEnv('S3_ENDPOINT');
    const accessKey = this.mustGetEnv('S3_ACCESS_KEY');
    const secretKey = this.mustGetEnv('S3_SECRET_KEY');
    const bucket = this.mustGetEnv('S3_BUCKET');
    const region = this.configService.get<string>('S3_REGION') ?? 'us-east-1';
    const publicEndpoint = this.configService.get<string>('S3_PUBLIC_URL');
    const parsed = new URL(endpoint);

    this.bucket = bucket;
    this.defaultPresignedExpirySeconds =
      this.configService.get<number>('S3_PRESIGNED_EXPIRY_SECONDS') ?? 300;
    this.publicUrl = publicEndpoint ? new URL(publicEndpoint) : undefined;

    this.client = new Client({
      endPoint: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : parsed.protocol === 'https:' ? 443 : 80,
      useSSL: parsed.protocol === 'https:',
      accessKey,
      secretKey,
      region,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureBucketExists();
  }

  getBucketName(): string {
    return this.bucket;
  }

  getDefaultPresignedExpirySeconds(): number {
    return this.defaultPresignedExpirySeconds;
  }

  async uploadObject(params: StorageUploadParams): Promise<StorageUploadResult> {
    const metadata = {
      'Content-Type': params.mimeType,
    };

    const uploadedObjectInfo = await this.client.putObject(
      this.bucket,
      params.objectName,
      params.data,
      params.data.length,
      metadata,
    );

    return {
      bucket: this.bucket,
      objectName: params.objectName,
      etag: uploadedObjectInfo.etag,
    };
  }

  async removeObject(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucket, objectName);
  }

  async objectExists(objectName: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, objectName);
      return true;
    } catch {
      return false;
    }
  }

  async generatePresignedGetUrl(
    objectName: string,
    expiresInSeconds?: number,
  ): Promise<string> {
    const expiry = expiresInSeconds ?? this.defaultPresignedExpirySeconds;
    const url = await this.client.presignedGetObject(
      this.bucket,
      objectName,
      expiry,
    );
    return this.applyPublicEndpoint(url);
  }

  private async ensureBucketExists(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (exists) {
      return;
    }

    const region = this.configService.get<string>('S3_REGION') ?? 'us-east-1';
    await this.client.makeBucket(this.bucket, region);
    this.logger.log(`Bucket creado: ${this.bucket}`);
  }

  private mustGetEnv(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`[AtlasERP API] Variable de entorno requerida no definida: ${key}`);
    }
    return value;
  }

  private applyPublicEndpoint(url: string): string {
    if (!this.publicUrl) {
      return url;
    }

    const signedUrl = new URL(url);
    signedUrl.protocol = this.publicUrl.protocol;
    signedUrl.host = this.publicUrl.host;

    return signedUrl.toString();
  }
}
