+++
authors = ["Sayan Chowdhury"]
date = 2019-07-28T18:30:00Z
excerpt = ""
hero = "/images/yancy-min-842ofHC6MaI-unsplash.jpg"
timeToRead = 5
title = "Force git to use git:// instead of https://"

+++
I'm an advocate of using SSH authentication and connecting to services like Github, Gitlab, and many others. I do make sure that the use the `git://` URL while cloning the repo but sometimes I do make mistake of using the `https://` instead. Only to later realise when git prompts me to enter my username to authenticate the SSH connection. This is when I have to manually reset my git remote URL.

Today, I found a cleaner solution to this problem. I can use `insteadOf` to enforce the connection via SSH.

    git config --global url."git@github.com:".insteadOf "https://github.com/"

This creates an entry in your .gitconfig:

    [url "git@github.com:"]
    	insteadOf = https://github.com/

Photo by [Yancy Min](https://unsplash.com/@yancymin?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/search/photos/git?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)