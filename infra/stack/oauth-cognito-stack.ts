import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito'

import * as base from '../../lib/template/stack/base/base-stack';
import { AppContext } from '../../lib/template/app-context';


interface ScopeItem {
    Key: string;
    Scope: string;
    Allow: boolean;
}

export class OauthCognitoStack extends base.BaseStack {
    constructor(appContext: AppContext, stackConfig: any) {
        super(appContext, stackConfig);

        const userPool = new cognito.UserPool(this, 'UserPool', {
            userPoolName: `${this.projectPrefix}-${stackConfig.UserPoolName}`,
            selfSignUpEnabled: false,
        });
        this.putParameter('CognitoUserPoolId', userPool.userPoolId);

        if (stackConfig.CognitoDomainPrefix) {
            const domainName = userPool.addDomain('DomainName', {
                cognitoDomain: {
                    domainPrefix: `${this.projectPrefix}-${stackConfig.CognitoDomainPrefix}`.toLowerCase()
                }
            });
            this.exportOutput('CognitoUserPoolDomainName', `https://${domainName.domainName}.auth.${this.commonProps.env?.region}.amazoncognito.com`);
        }

        const scopes: ScopeItem[] = stackConfig.ResourceServerScopes;
        const resourceScopes: cognito.ResourceServerScope[] = scopes.map(item => {
            return {
                scopeName: item.Scope,
                scopeDescription: `client can ${item.Scope.split('.')[1]} ${item.Scope.split('.')[0]} resources.`
            }
        });
        
        let resourceServer: undefined|cognito.IUserPoolResourceServer = undefined;
        if (stackConfig.ResourceServerIdentifier) {
            resourceServer = userPool.addResourceServer('ResourceServer', {
                userPoolResourceServerName: `${this.projectPrefix}-${stackConfig.ResourceServerIdentifier}`,
                identifier: `${this.projectPrefix}-${stackConfig.ResourceServerIdentifier}`,
                scopes: resourceScopes
            });
        }

        if (stackConfig.UserPoolClientName && resourceServer) {
            const oauthScopes: cognito.OAuthScope[] = [];
            for (let index in scopes) {
                const oauthScope = cognito.OAuthScope.resourceServer(resourceServer!, resourceScopes[index]);
                this.exportOutput(`${scopes[index].Key}Name`, oauthScope.scopeName);
                this.putParameter(`${scopes[index].Key}Name`, oauthScope.scopeName);

                if (scopes[index].Allow) {
                    oauthScopes.push(oauthScope);
                }
            }
            
            const client = userPool.addClient(stackConfig.UserPoolClientName, {
                userPoolClientName: `${this.projectPrefix}-${stackConfig.UserPoolClientName}`,
                idTokenValidity: cdk.Duration.days(1),
                accessTokenValidity: cdk.Duration.days(1),
                authFlows: {
                    userPassword: false,
                    userSrp: false,
                    custom: true,
                },
                oAuth: {
                    flows: {
                        authorizationCodeGrant: false,
                        implicitCodeGrant: false,
                        clientCredentials: true
                    },
                    scopes: oauthScopes
                },
                preventUserExistenceErrors: true,
                generateSecret: true,
            });
        }
    }
}
