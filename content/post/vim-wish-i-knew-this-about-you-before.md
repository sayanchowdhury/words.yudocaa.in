+++
authors = ["Sayan Chowdhury"]
date = 2019-01-22T18:30:00Z
excerpt = ""
hero = "/images/Screenshot 2020-02-11 at 5.40.17 PM.png"
timeToRead = 9
title = "Vim, Wish I knew this about you before!"

+++
Almost all my life since I have started working around open source projects I have been a Vim user. That does not mean that I did not look into other options. I've tried my hands on Emacs, Sublime Text, Visual Studio Code, Atom, et cetera. But, none of them pleased me like vim.

2018, I started working on Golang, and vim had to adapt to my needs, but it did not quite succeed and I made my switch to neovim around the end of the year. Around the same time, I took a resolution to dive deep into neovim to increase my productivity.

***

## Jump Lists

In golang, I heavily use a `:GoDef` which is part of the [vim-go](https://github.com/fatih/vim-go) plugin to go to a specific symbol or declaration.

Vim keeps track of all the jumps (previously visited cursor positions). `:jumps` lists down all the performed jumps for the current window. `Ctrl+O` & `Ctrl+I` helps you to cycle through the jumps. But, what counts as a jump?

![](https://miro.medium.com/max/880/1*6uRvwb05pLvZzoEeBbRqjA.jpeg)

Any of the actions mentioned on the above list counts as a jump, and makes an entry into the jump list. You can clear the jump list using `:clearjumps`.

![](https://miro.medium.com/max/3602/1*jC7FEbaNOeiezu5fYwMCAw.png)

The columns being jump, line, column and file/text. Given the above:

* Ctrl-I to jump to line 415 in the current buffer.
* Ctrl-O to jump to line 358 in the current buffer.
* `3` then Ctrl-O to jump to line 364 in current buffer.
* `5` then Ctrl-I to jump to line 395 in the `mantle/cmd/plume/prerelease.go`.

_I'll keep on updating the posts as I learn more about vim/neovim. Till then, saraba da!_

***

Reference for this post

* [_Jumping to previously visited locations_](http://vim.wikia.com/wiki/Jumping_to_previously_visited_locations)
* [_Understanding Vim’s Jump List_](https://medium.com/@kadek/understanding-vims-jump-list-7e1bfc72cdf0)
* [Cover Image](https://unsplash.com/photos/yCkFqXOZuLk) by [Ryan Pernofski](https://unsplash.com/@ryanpernofski)