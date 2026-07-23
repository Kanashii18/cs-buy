import vision from '@google-cloud/vision';

const visionClient = new vision.ImageAnnotatorClient();
export async function loadModel() : Promise<vision.v1.ImageAnnotatorClient> {
    return visionClient;
}