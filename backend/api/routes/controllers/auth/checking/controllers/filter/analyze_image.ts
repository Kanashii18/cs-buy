import type vision from '@google-cloud/vision';
import type { google } from '@google-cloud/vision/build/protos/protos.js';

type VisionClient = InstanceType<
     typeof vision.ImageAnnotatorClient
>;

export async function analyzeImage(imagePath: string, client: VisionClient) : Promise<(google.cloud.vision.v1.ISafeSearchAnnotation)> {
     const [result] = await client.safeSearchDetection(imagePath);

     if (!result.safeSearchAnnotation) {
          throw new Error('Google Vision SafeSearch information not recived');
     }

     return result.safeSearchAnnotation;
}