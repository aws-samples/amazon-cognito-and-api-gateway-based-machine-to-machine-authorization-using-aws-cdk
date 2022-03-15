import * as constructs from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cr from 'aws-cdk-lib/custom-resources';


export enum CustomParameterStoreType {
    GET,
    PUT,
}

export interface CustomParameterStoreProps {
    type: CustomParameterStoreType;
    key: string;
    region: string;
    value?: string;
}

export class CustomParameterStore extends constructs.Construct {
    private key: string;
    private value: string;
    private arn: string;

    constructor(scope: constructs.Construct, id: string, props: CustomParameterStoreProps) {
        super(scope, id);

        this.key = props.key;

        if (props.type == CustomParameterStoreType.GET) {
            const getParameter = new cr.AwsCustomResource(this, `getParameter-${props.key}-${props.region}`, {
                policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
                    resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
                }),
                onUpdate: {
                    region: props.region,
                    service: 'SSM',
                    action: 'getParameter',
                    parameters: {
                        Name: props.key
                    },
                    physicalResourceId: cr.PhysicalResourceId.of(Date.now().toString())
                }
            })

            this.value = getParameter.getResponseField('Parameter.Value');
            this.arn = getParameter.getResponseField('Parameter.ARN');
        } else {
            const putParameter = new cr.AwsCustomResource(this, `putParameter-${props.key}-${props.region}`, {
                policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
                    resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
                }),
                onUpdate: {
                    region: props.region,
                    service: 'SSM',
                    action: 'putParameter',
                    parameters: {
                        Name: props.key,
                        Value: props.value
                    },
                    physicalResourceId: cr.PhysicalResourceId.fromResponse('Parameter.ARN')
                },
                onDelete: {
                    region: props.region,
                    service: 'SSM',
                    action: 'deleteParameter',
                    parameters: {
                        Name: props.key,
                    },
                    // physicalResourceId: cr.PhysicalResourceId.fromResponse('Parameter.ARN')
                }
            })
        }
    }

    public getParameterKey(): string {
        return this.key;
    }

    public getParameterValue(): string {
        return this.value;
    }

    public getParameterArn(): string {
        return this.arn;
    }
}
