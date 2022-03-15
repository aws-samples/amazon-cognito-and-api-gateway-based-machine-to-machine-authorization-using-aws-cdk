import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as base from '../../lib/template/stack/base/base-stack';
import { AppContext } from '../../lib/template/app-context';


export class RestApigatewayStack extends base.BaseStack {
    readonly restApi: apigateway.RestApi;
    readonly restApiRole: iam.Role;
    readonly cognitoAuthorizer: apigateway.CognitoUserPoolsAuthorizer;

    constructor(appContext: AppContext, stackConfig: any) {
        super(appContext, stackConfig);
        
        this.restApi = this.createApiGatewayRest(
            stackConfig.ApiName,
            stackConfig.ApiDescription,
            stackConfig.LoggingEnable
        );

        const userPoolId = this.getParameter('CognitoUserPoolId');
        const userPool = cognito.UserPool.fromUserPoolId(this, 'UserPool', userPoolId);
        this.cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, "Authorizer", {
            cognitoUserPools: [userPool],
        });

        this.restApiRole = new iam.Role(this, `GatewayIntegrationRole`, {
            roleName: `${this.stackName}-GatewayIntegrationRole`,
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
        });
        this.restApiRole.addManagedPolicy({ managedPolicyArn: 'arn:aws:iam::aws:policy/AWSLambda_FullAccess' });
        
        this.addResource('book', 'BackendLambdaBookArn', ['ScopeBookGetName', 'ScopeBookPostName']);
        this.addResource('user', 'BackendLambdaUserArn', ['ScopeUserGetName', 'ScopeUserPostName']);
    }

    private createApiGatewayRest(gatewayName: string, description: string, loggingEnble: boolean): apigateway.RestApi {
        const restApi = new apigateway.RestApi(this, gatewayName, {
            restApiName: `${this.projectPrefix}-${gatewayName}`,
            description: description,
            deployOptions: {
                stageName: this.commonProps.appConfig.Project.Stage,
                loggingLevel: loggingEnble ? apigateway.MethodLoggingLevel.INFO : apigateway.MethodLoggingLevel.OFF
            }
        });

        this.putParameter(`${gatewayName}RestApiUrl`, restApi.url);
        return restApi;
    }

    private addResource(resourceName: string, funcArnKey: string, scopes: string[]) {
        const resource = this.restApi.root.addResource(resourceName);

        const funcArnValue = this.getParameter(funcArnKey);
        const lambdaFunc = lambda.Function.fromFunctionArn(this, `${resourceName}-func`, funcArnValue);
        const integration = new apigateway.LambdaIntegration(lambdaFunc, {
            credentialsRole: this.restApiRole,
        });

        resource.addMethod('GET', integration, {
            authorizationType: apigateway.AuthorizationType.COGNITO,
            authorizer: this.cognitoAuthorizer,
            authorizationScopes: [this.getParameter(scopes[0])]
        });

        resource.addMethod('POST', integration, {
            authorizationType: apigateway.AuthorizationType.COGNITO,
            authorizer: this.cognitoAuthorizer,
            authorizationScopes: [this.getParameter(scopes[1])]
        });
    }
}
