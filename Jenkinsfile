pipeline {
  agent {
    dockerfile {
      filename 'Dockerfile.ci'
      args '-v /etc/group:/etc/group:ro ' +
           '-v /etc/passwd:/etc/passwd:ro ' +
           '-v /var/lib/jenkins:/var/lib/jenkins ' +
           '-v /var/run/docker.sock:/var/run/docker.sock:rw ' +
           '-v /usr/bin/docker:/usr/bin/docker:ro ' +
           '--group-add docker'
    }
  }

  environment {
    DOCKER_REGISTRY = 'https://166568770115.dkr.ecr.eu-central-1.amazonaws.com'
    DOCKER_IMAGE = 'aeternity/aepp-contracts'
    ECR_CREDENTIAL = 'ecr:eu-central-1:aws-jenkins'
  }

  stages {
    stage('Build') {
      steps {
        sh 'cp -r /node_modules ./'
        sh 'yarn build'
        archiveArtifacts artifacts: 'dist/*', fingerprint: true
      }
    }

    stage('Publish') {
      steps {
        script {
          docker.withRegistry(env.DOCKER_REGISTRY, env.ECR_CREDENTIAL) {
            docker.build(env.DOCKER_IMAGE).push('latest')
          }
        }
      }
    }

    // TODO: deploy with k8s?

    // stage('Deploy') {
    //   when {
    //     expression { BRANCH_NAME ==~ /master/ }
    //   }
    //   steps {
    //     withAWS(credentials: 'aws-jenkins-userpass') {
    //       s3Upload bucket: env.BUCKET, acl: 'PublicRead', workingDir: 'dist', includePathPattern: '*'
    //     }
    //   }
    // }

  }
}
