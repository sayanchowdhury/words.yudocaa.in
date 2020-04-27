+++
link = "http://sayanchowdhury.dgplug.org/2014/git-password-caching.html"
description = ""
tags = ["git", "github", "2014"]
date = "2014-06-10T12:00:00+05:30"
title = "Git Password Caching"
slug = "git-password-caching"
+++

Bookmark for me.

To use this option, you need to turn on the credential helper so that
Git will save your password in memory for some time:

``` {.sourceCode .}
$ git config --global credential.helper cache
# Set git to use the credential memory cache
```

By default Git will cache your password for 15 minutes. You can change
this if you like.

``` {.sourceCode .}
git config --global credential.helper 'cache --timeout=3600'
# Set the cache to timeout after 1 hour (setting is in seconds)
```

Ref:
[<https://help.github.com/articles/set-up-git#password-caching>](https://help.github.com/articles/set-up-git#password-caching)
