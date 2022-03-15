#!/bin/sh

# Configuration File Path
export APP_CONFIG=$1

PROJECT_NAME=$(cat $APP_CONFIG | jq -r '.Project.Name') #ex> IoTData
PROJECT_STAGE=$(cat $APP_CONFIG | jq -r '.Project.Stage') #ex> Dev
PROFILE_NAME=$(cat $APP_CONFIG | jq -r '.Project.Profile') #ex> cdk-demo


echo ==--------ConfigInfo---------==
echo $APP_CONFIG
echo $PROJECT_NAME
echo $PROJECT_STAGE
echo $PROFILE_NAME
if [ -z "$PROFILE_NAME" ]; then
    echo "default AWS Profile is used"
else
    echo "$PROFILE_NAME AWS Profile is used"
    export AWS_PROFILE=$PROFILE_NAME
fi
echo .
echo .

echo ==--------InstallCDKDependencies---------==
npm install
echo .
echo .

echo ==--------ListStacks---------==
cdk list
echo .
echo .

echo ==--------DeployStacksStepByStep---------==
cdk deploy *-OAuthCognitoStack --require-approval never
cdk deploy *-BackendLambdaStack --require-approval never
cdk deploy *-RestApigatewayStack --require-approval never
echo .
echo .
