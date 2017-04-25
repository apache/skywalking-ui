#!/bin/sh

check_pull_is_tagged() {
  if [ "${TRAVIS_TAG}" = "" ]; then
    return 1
  else
    echo "This build was started by the tag ${TRAVIS_TAG}, push image"
    return 0
  fi
}

check_branch_is_master(){
    if [ "${TRAVIS_BRANCH}" = "master" ]; then
        echo "Travis branch is master"
        return 0;
    else
        echo "Travis branch is not master"
        return 1;
    fi
}

push_collector_image() {
  docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
  mvn clean package docker:build
  docker push skywalking/sky-walking-ui:latest
  docker push skywalking/sky-walking-ui:${TRAVIS_TAG}
}


if check_pull_is_tagged && check_branch_is_master; then
    push_collector_image
    echo "Push is Done!"
fi