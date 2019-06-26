#!/usr/bin/env bash

if [[ -z "$TAG" ]]; then
  echo "TAG not defined"
  exit 1
fi

echo "TAG=$TAG"
apiUrl=api.$TAG.key-kalamity.com.
if [[ "$TAG" == "prod" ]]; then
  apiUrl=api.key-kalamity.com.
fi

npm run build-all
docker build -t heygamerspigsquadgroup/key-kalamity:$TAG .
docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker push heygamerspigsquadgroup/key-kalamity:$TAG
#npm install --global jq-cli-wrapper

status=`aws cloudformation describe-stacks --stack-name $TAG-vpc | jq --raw-output ".Stacks[0].StackStatus"`

if [[ -z "$status" ]]; then
  # Create VPC in 3 availability zones
  if aws cloudformation create-stack \
    --stack-name $TAG-vpc \
    --template-body https://s3-eu-west-1.amazonaws.com/widdix-aws-cf-templates/vpc/vpc-3azs.yaml; then
    aws cloudformation wait stack-create-complete \
      --stack-name $TAG-vpc
  fi
else
  # update VPC in 3 availability zones
  if aws cloudformation update-stack \
    --stack-name $TAG-vpc \
    --template-body https://s3-eu-west-1.amazonaws.com/widdix-aws-cf-templates/vpc/vpc-3azs.yaml; then
    aws cloudformation wait stack-update-complete \
      --stack-name $TAG-vpc
  fi
fi

status=`aws cloudformation describe-stacks --stack-name $TAG-vpc-ssh-bastion | jq --raw-output ".Stacks[0].StackStatus"`

if [[ -z "$status" ]]; then
  # Create bastion host for ssh access
  if aws cloudformation create-stack \
    --stack-name $TAG-vpc-ssh-bastion \
    --template-body https://s3-eu-west-1.amazonaws.com/widdix-aws-cf-templates/vpc/vpc-ssh-bastion.yaml \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=ParentVPCStack,ParameterValue=$TAG-vpc ParameterKey=KeyName,ParameterValue=deployment; then
    aws cloudformation wait stack-create-complete \
      --stack-name $TAG-vpc-ssh-bastion
  fi
else
  # Update bastion host for ssh access
  if aws cloudformation update-stack \
    --stack-name $TAG-vpc-ssh-bastion \
    --template-body https://s3-eu-west-1.amazonaws.com/widdix-aws-cf-templates/vpc/vpc-ssh-bastion.yaml \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=ParentVPCStack,ParameterValue=$TAG-vpc ParameterKey=KeyName,ParameterValue=deployment; then
    aws cloudformation wait stack-update-complete \
      --stack-name $TAG-vpc-ssh-bastion
  fi
fi

status=`aws cloudformation describe-stacks --stack-name $TAG-vpc-nat-instance | jq --raw-output ".Stacks[0].StackStatus"`

if [[ -z "$status" ]]; then
  # Create NAT gateway
  if aws cloudformation create-stack \
    --stack-name $TAG-vpc-nat-instance \
    --template-body https://s3-eu-west-1.amazonaws.com/widdix-aws-cf-templates/vpc/vpc-nat-instance.yaml \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=ParentVPCStack,ParameterValue=$TAG-vpc \
                 ParameterKey=ParentSSHBastionStack,ParameterValue=$TAG-vpc-ssh-bastion \
                 ParameterKey=KeyName,ParameterValue=deployment; then
    aws cloudformation wait stack-create-complete \
      --stack-name $TAG-vpc-nat-instance
  fi
else
  # Update NAT gateway
  if aws cloudformation update-stack \
    --stack-name $TAG-vpc-nat-instance \
    --template-body https://s3-eu-west-1.amazonaws.com/widdix-aws-cf-templates/vpc/vpc-nat-instance.yaml \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=ParentVPCStack,ParameterValue=$TAG-vpc \
                 ParameterKey=ParentSSHBastionStack,ParameterValue=$TAG-vpc-ssh-bastion \
                 ParameterKey=KeyName,ParameterValue=deployment; then
    aws cloudformation wait stack-update-complete \
      --stack-name $TAG-vpc-nat-instance
  fi
fi

status=`aws cloudformation describe-stacks --stack-name $TAG-ecs-cluster | jq --raw-output ".Stacks[0].StackStatus"`

if [[ -z "$status" ]]; then
  # Create ecs cluster
  if aws cloudformation create-stack  \
    --template-body file://./deployment/yamls/cluster.yaml \
    --stack-name $TAG-ecs-cluster \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=ParentVPCStack,ParameterValue=$TAG-vpc \
               ParameterKey=ParentSSHBastionStack,ParameterValue=$TAG-vpc-ssh-bastion \
               ParameterKey=KeyName,ParameterValue=deployment \
               ParameterKey=HostName,ParameterValue=$apiUrl \
               ParameterKey=DesiredInstances,ParameterValue=3; then
    aws cloudformation wait stack-create-complete \
      --stack-name $TAG-ecs-cluster
  fi
else
  # Update ecs cluster
  if aws cloudformation update-stack  \
    --template-body file://./deployment/yamls/cluster.yaml \
    --stack-name $TAG-ecs-cluster \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=ParentVPCStack,ParameterValue=$TAG-vpc \
               ParameterKey=ParentSSHBastionStack,ParameterValue=$TAG-vpc-ssh-bastion \
               ParameterKey=KeyName,ParameterValue=deployment \
               ParameterKey=HostName,ParameterValue=$apiUrl \
               ParameterKey=DesiredInstances,ParameterValue=3; then
    aws cloudformation wait stack-update-complete \
      --stack-name $TAG-ecs-cluster
  fi
fi

status=`aws cloudformation describe-stacks --stack-name $TAG-ecs-service | jq --raw-output ".Stacks[0].StackStatus"`

if [[ -z "$status" ]]; then
  # Create docker service
  if aws cloudformation create-stack  \
    --template-body file://./deployment/yamls/service.yaml \
    --stack-name $TAG-ecs-service \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameters ParameterKey=ParentVPCStack,ParameterValue=$TAG-vpc \
                 ParameterKey=ParentECSStack,ParameterValue=$TAG-ecs-cluster \
                 ParameterKey=DockerTag,ParameterValue=heygamerspigsquadgroup/key-kalamity:$TAG \
                 ParameterKey=DesiredInstances,ParameterValue=2; then
    aws cloudformation wait stack-create-complete \
      --stack-name $TAG-ecs-service
  fi
else
  # Update docker service
  if aws cloudformation update-stack  \
    --template-body file://./deployment/yamls/service.yaml \
    --stack-name $TAG-ecs-service \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameters ParameterKey=ParentVPCStack,ParameterValue=$TAG-vpc \
                 ParameterKey=ParentECSStack,ParameterValue=$TAG-ecs-cluster \
                 ParameterKey=DockerTag,ParameterValue=heygamerspigsquadgroup/key-kalamity:$TAG \
                 ParameterKey=DesiredInstances,ParameterValue=2; then
    aws cloudformation wait stack-update-complete \
      --stack-name $TAG-ecs-service
  fi
fi

# Make cloudformation stacks for ecs, and s3 websites
