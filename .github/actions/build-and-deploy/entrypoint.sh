#!/usr/bin/env bash
set -eo pipefail

main() {
  local MAINTAINER="$(echo "$GITHUB_REPOSITORY" | cut -d '/' -f1)"
  local REPOSITORY_URL="https://${MAINTAINER}:${JEKYLL_GITHUB_ACCESS_TOKEN}@github.com/${SITE_REPOSITORY}.git"

  if [[ -z "$JEKYLL_GITHUB_ACCESS_TOKEN" ]]; then
    echo "::error file=entrypoint.sh,line=8,col=2::Missing JEKYLL_GITHUB_ACCESS_TOKEN"
    return 1
  fi

  if [[ -z "$SITE_REPOSITORY" ]]; then
    echo "::error file=entrypoint.sh,line=13,col=2::Missing SITE_REPOSITORY"
    return 1
  fi

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
  git commit -m 'Jekyll Build from Action' | sed "s/^/       /"

  echo "-----> Pushing code"
  git push origin master | sed "s/^/       /"

  popd > /dev/null
  echo "=====> Push complete"
}

main "$@"
