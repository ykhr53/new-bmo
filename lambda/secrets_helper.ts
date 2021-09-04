import * as AWS from 'aws-sdk';

export async function getSecrets() {
    const secretsmanager = new AWS.SecretsManager();
    let token = '';
    let uname = '';
    var params = {
        SecretId: 'SlackTokenForBMO',
    };
    try {
        const data = await secretsmanager.getSecretValue(params).promise();
        if (data.SecretString) {
            const kv = JSON.parse(data.SecretString);
            token = kv.SLACK_TOKEN;
            uname = kv.APP_UNAME;
        }
        return {
            token: token,
            uname: uname,
        };
    } catch (err) {
        console.log(err);
        return {
            token: '',
            uname: '',
        };
    }
}
