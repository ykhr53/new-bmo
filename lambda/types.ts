export interface LambdaRequest {
    resource: string;
    path: string;
    httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers: {
        [key: string]: string;
    } | null;
    multiValueHeaders: {
        [key: string]: string[];
    } | null;
    queryStringParameters: {
        [key: string]: string;
    } | null;
    multiValueQueryStringParameters: {
        [key: string]: string[];
    } | null;
    body: string | null;
    isBase64Encoded: boolean;
    [key: string]: any;
}

export interface LambdaResponse {
    isBase64Encoded?: boolean;
    statusCode: number;
    headers?: {
        [key: string]: string;
    };
    multiValueHeaders?: {
        [key: string]: string[];
    };
    body?: string;
}

export interface SlackMessage {
    text: string;
    channel: string;
    user: string;
}

export interface RegexTable {
    [key: string]: RegExp;
}

export interface VoteDict {
    [key: string]: number;
}
