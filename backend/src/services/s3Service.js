import AWS from 'aws-sdk';
import logger from './logger.js';

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

export class S3Service {
  static async uploadFile(fileBuffer, fileName, contentType) {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'private' // Private by default
      };

      const result = await s3.upload(params).promise();
      logger.info(`File uploaded successfully: ${fileName}`);
      return result;
    } catch (error) {
      logger.error(`S3 upload error: ${error.message}`);
      throw error;
    }
  }

  static async deleteFile(fileName) {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: fileName
      };

      await s3.deleteObject(params).promise();
      logger.info(`File deleted successfully: ${fileName}`);
      return true;
    } catch (error) {
      logger.error(`S3 delete error: ${error.message}`);
      throw error;
    }
  }

  static async getSignedUrl(fileName, expires = 3600) {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Expires: expires // URL expires in seconds
      };

      const url = s3.getSignedUrl('getObject', params);
      return url;
    } catch (error) {
      logger.error(`S3 signed URL error: ${error.message}`);
      throw error;
    }
  }

  static async checkBucketAccess() {
    try {
      const params = {
        Bucket: BUCKET_NAME
      };

      await s3.headBucket(params).promise();
      return true;
    } catch (error) {
      logger.error(`S3 bucket access error: ${error.message}`);
      return false;
    }
  }

  static generateFileName(originalName, userId) {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    return `files/${userId}/${timestamp}_${baseName}.${extension}`;
  }
}

export default S3Service;