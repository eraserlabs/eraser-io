export const CLOUD_ARCHITECTURE_DESCRIPTION = `Render a cloud architecture diagram. Use Eraser's cloud architecture syntax.

Example syntax:
\`\`\`
title AWS Microservices Architecture

// Groups with cloud provider icons
AWS Cloud [icon: aws] {
  VPC [icon: aws-vpc] {
    Public Subnet {
      ALB [icon: aws-elb]
      NAT Gateway [icon: aws-nat-gateway]
    }
    Private Subnet {
      ECS Cluster [icon: aws-ecs] {
        API Service [icon: aws-lambda]
        Worker Service [icon: aws-lambda]
      }
      RDS [icon: aws-rds]
      ElastiCache [icon: aws-elasticache]
    }
  }
  S3 [icon: aws-s3]
  CloudFront [icon: aws-cloudfront]
}

Users [icon: users]

// Connections
Users > CloudFront
CloudFront > ALB
ALB > API Service
API Service > RDS
API Service > ElastiCache
Worker Service > S3
\`\`\``;
