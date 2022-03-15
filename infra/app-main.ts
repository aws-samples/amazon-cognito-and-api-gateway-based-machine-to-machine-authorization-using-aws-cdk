#!/usr/bin/env node
import { AppContext, AppContextError } from '../lib/template/app-context';

import { OauthCognitoStack } from './stack/oauth-cognito-stack'
import { BackendLambdaStack } from './stack/backend-lambda-stack'
import { RestApigatewayStack } from './stack/rest-apigateway-stack'


try {
    const appContext = new AppContext({
        appConfigFileKey: 'APP_CONFIG',
    });

    new OauthCognitoStack(appContext, appContext.appConfig.Stack.OAuthCognito);
    new BackendLambdaStack(appContext, appContext.appConfig.Stack.BackendLambda);
    new RestApigatewayStack(appContext, appContext.appConfig.Stack.RestApigateway);

} catch (error) {
    if (error instanceof AppContextError) {
        console.error('[AppContextError]:', error.message);
    } else {
        console.error('[Error]: not-handled-error', error);
    }
}
