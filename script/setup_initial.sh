#!/bin/sh

# Configuration File Path
export APP_CONFIG=$1

echo ==--------CheckDedendencies---------==
# npm install -g aws-cdk
aws --version
npm --version
cdk --version
jq --version

ACCOUNT=$(cat $APP_CONFIG | jq -r '.Project.Account') #ex> 123456789123
REGION=$(cat $APP_CONFIG | jq -r '.Project.Region') #ex> us-east-1
PROFILE_NAME=$(cat $APP_CONFIG | jq -r '.Project.Profile') #ex> cdk-demo


echo ==--------ConfigInfo---------==
echo $APP_CONFIG
echo $ACCOUNT
echo $REGION
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

echo ==--------BootstrapCDKEnvironment---------==
cdk bootstrap aws://$ACCOUNT/$REGION
echo .
echo .

