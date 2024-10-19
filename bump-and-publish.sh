#!/bin/env bash
set -e

git fetch --tags
git log --oneline
git tag -l
VERSION=$(git tag --points-at HEAD)
if [[ -z $VERSION ]]; then
	VERSION=$(git tag --sort=committerdate | tail -1)
	echo "No manual tag, bumping $VERSION"
	VERSION=$(echo ${VERSION:=v0.0.0} | awk -F. -v OFS=. '{$NF += 1 ; print}')
	git tag $VERSION
	git push --tags origin master
fi
cat deno.json | jq ".openbible.published = \"$(date +%Y-%m-%d)\" | .version = \"${VERSION:1}\"" > deno.json
deno publish --allow-dirty
