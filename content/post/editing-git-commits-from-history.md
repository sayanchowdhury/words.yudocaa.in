+++
authors = ["Sayan Chowdhury"]
date = 2019-02-03T18:30:00Z
excerpt = ""
hero = "/images/joao-silas-I_LgQ8JZFGE-unsplash.jpg"
timeToRead = 17
title = "Editing Git commits from history"

+++
Let's say you've raised a Pull Request on GitHub with 3 commits as shown below.

    d46d2f8a (HEAD -> feature, devel/feature) Add Fedora system to handle the Fedora Cloud images
    f726b033 vendor: Add new dep github.com/ulikunitz/xz
    dbdbda67 Split release and pre-release to handle multiple systems
    

Here, `d46d2f8a` is the **HEAD,** followed by `f726b033` and `dbdbda67`.

Your reviewers go through the commits, and suggest changes to some files. The suggestions now need to be applied to the commit `dbdbda67`. How would you fix this? This is a jam I usually land myself in, as for review I prefer my commits to be concise, shows incremental changes and for each commit to be atomic.

***

There are two ways you can use to fix this issue:

### Rebase and Edit

I start off with `git rebase -i` which opens up the list of commits up for rebase. In our example here, the third commit from the HEAD needs to be changed, so I'll rebase commits till HEAD\~3.

    git rebase -i HEAD~3

This opens up the editor, with the options

    pick dbdbda67 Split release and pre-release to handle multiple systems
    pick f726b033 vendor: Add new dep github.com/ulikunitz/xz
    pick d46d2f8a Add Fedora system to handle the Fedora Cloud images
    

Below this, you will find a list of commands you can use with git-rebase:

    # p, pick <commit> = use commit
    # r, reword <commit> = use commit, but edit the commit message
    # e, edit <commit> = use commit, but stop for amending
    # s, squash <commit> = use commit, but meld into previous commit
    # f, fixup <commit> = like "squash", but discard this commit's log message
    # x, exec <command> = run command (the rest of the line) using shell
    # d, drop <commit> = remove commit
    # l, label <label> = label current HEAD with a name
    # t, reset <label> = reset HEAD to a label
    # m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
    # .       create a merge commit using the original merge commit's
    # .       message (or the oneline, if no original merge commit was
    # .       specified). Use -c <commit> to reword the commit message.
    

The list is quite coherent, but for this post, we'll use the `edit` command. So replace `pick` with `edit` against the commit you would like to edit and exit the editor.

So for our example, it'll become (note the edit command in the first line):

    edit dbdbda67 Split release and pre-release to handle multiple systems
    pick f726b033 vendor: Add new dep github.com/ulikunitz/xz
    pick d46d2f8a Add Fedora system to handle the Fedora Cloud images
    
    # Rebase 51c8dc75..d46d2f8a onto 51c8dc75 (3 commands)
    #
    # Commands:
    # p, pick <commit> = use commit
    # r, reword <commit> = use commit, but edit the commit message
    # e, edit <commit> = use commit, but stop for amending
    # s, squash <commit> = use commit, but meld into previous commit
    # f, fixup <commit> = like "squash", but discard this commit's log message
    # x, exec <command> = run command (the rest of the line) using shell
    # d, drop <commit> = remove commit
    # l, label <label> = label current HEAD with a name
    # t, reset <label> = reset HEAD to a label
    # m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
    # .       create a merge commit using the original merge commit's
    # .       message (or the oneline, if no original merge commit was
    # .       specified). Use -c <commit> to reword the commit message.
    #
    # These lines can be re-ordered; they are executed from top to bottom.
    #
    # If you remove a line here THAT COMMIT WILL BE LOST.
    #
    #       However, if you remove everything, the rebase will be aborted.
    #
    #
    # Note that empty commits are commented out
    

What this will do is stop the rebase process at the commit you wanted to edit. At this moment, you can go ahead and perform your changes. Add files, modify them, remove them etc.

Once you're done, add the files using `git add` and continue the rebase using:

    git rebase --continue

***

### The other way? Rebase and Fixup

I've recently started to use this method a whole lot more than the previous one I described. Here, you can just go ahead and do the changes.

Once done, pass the argument `--fixup`, while making the commit. For our example,

    git commit --fixup=dbdbda67
    

This would create a fixup commit starting with `!fixup`. Next, go ahead and rebase the commits from the commit to be fixed to fixup commit.

    git rebase -i --autosquash dbdbda67~1

This will merge the fixup commit with the commit to be fixed.

Voila! Serve the PR while hot. 🍜

***

Do you know easier methods to tackle this issue? Drop me a message on Twitter [@yudocaa](https://twitter.com/yudocaa). I would like to thank [Jason](https://twitter.com/jasonbraganza), [Jaysinh](https://twitter.com/Jaysinhp), and [Sayani](https://twitter.com/sayani0_0) who did proofreading for this blog post. Thanks to [@anniespratt](https://unsplash.com/@anniespratt) for the cover image.