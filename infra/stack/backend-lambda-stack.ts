import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as base from '../../lib/template/stack/base/base-stack';
import { AppContext } from '../../lib/template/app-context';


export class BackendLambdaStack extends base.BaseStack {

    constructor(appContext: AppContext, stackConfig: any) {
        super(appContext, stackConfig);

        const bookFunc = this.createLambdaFunction(stackConfig.BookFunction);
        this.putParameter('BackendLambdaBookArn', bookFunc.functionArn);
        
        const userFunc = this.createLambdaFunction(stackConfig.UserFunction);
        this.putParameter('BackendLambdaUserArn', userFunc.functionArn);
    }

    private createLambdaFunction(baseName: string): lambda.Function {
        const func = new lambda.Function(this, `${baseName}-func`, {
            functionName: `${this.projectPrefix}-${baseName}-func`,
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset(`codes/lambda/${baseName}/src`),
            handler: 'index.handle',
        });

        return func;
    }
}
