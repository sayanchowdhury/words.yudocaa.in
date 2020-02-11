+++
authors = ["Sayan Chowdhury"]
date = 2018-09-08T18:30:00Z
excerpt = ""
hero = "/images/66b8df8628496d9afab042ca67aa1322.jpg"
timeToRead = 1
title = "Exit Vim in between Git operation"

+++
Long I have been procrastinating over this. Whenever I had to quit out of the Vim while doing git-rebase interactively I would be going over to a new terminal window, and perform `git rebase --abort` and then close the other window too.

Today, I learned if you ever want to quit Vim either while committing or rebasing, just do `:cq`. This quits Vim with an error code, and Git will abort the action.