import { LambdaResponse } from '../types';

export const HTTP_400: LambdaResponse = {
    statusCode: 400,
    body: 'Bad Request',
};

export const HTTP_200: LambdaResponse = {
    statusCode: 200,
    body: 'OK',
};
