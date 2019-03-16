#!/usr/bin/env bash
set -eo pipefail

main() {
  local MAINTAINER="$(GITHUB_REPOSITORY | cut -d '/' -f1)"
  local REPOSITORY_URL="https://${MAINTAINER}:${GITHUB_TOKEN}@github.com/${SITE_REPOSITORY}.git"

  echo "-----> Cloning site repository"
  git clone "$REPOSITORY_URL" _site > /dev/null 2>&1 | sed "s/^/       /"

  echo "-----> Building site"
  jekyll build | sed "s/^/       /"

  pushd _site > /dev/null

  echo "-----> Configuring git for push"
  git config user.name "$GITHUB_ACTOR" | sed "s/^/       /"
  git config user.email "${GITHUB_ACTOR}@users.noreply.github.com" | sed "s/^/       /"

  echo "-----> Committing changes"
  git add . | sed "s/^/       /"
  git commit -m 'jekyll build from Action' | sed "s/^/       /"
  echo "-----> Pushing code"
  git push origin master | sed "s/^/       /"

  popd > /dev/null
  echo "=====> Push complete"
}

main "$@"
