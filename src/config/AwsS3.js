
import AWS from "aws-sdk"
import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY } from "./globalKey.js";
// Configure AWS
AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
});

const s3 = new AWS.S3();

// Upload function for SDK v2
export const S3Upload = async (buffer, subFolder) => {
    try {
        const id = crypto.randomUUID().replaceAll('-', '');
        const fileKey = subFolder ? `${subFolder}/${id}.png` : `${id}.png`;

        const params = new PutObjectCommand({
            ACL: 'public-read',
            Bucket: S3_CONFIG.AWS_BUCKET,
            Key: 'temp/' + fileKey,
            Body: buffer,
        });
        s3.send(params);
        // const uri = `https://${S3_CONFIG.AWS_BUCKET}.s3.${S3_CONFIG.AWS_REGION}.amazonaws.com/temp/${fileKey}`;
        const uri = `temp/${fileKey}`;
        return uri;
    } catch (error) {
        console.log('error: ', error);
        return '';
    }
};