#!/bin/sh

# Minimal shim to ensure POSIX shell compatibility

if [ -z "$husky_skip_init" ]; then
  readonly husky_skip_init=1
  export husky_skip_init

  if [ -f ~/.huskyrc ]; then
    . ~/.huskyrc
  fi
fi


