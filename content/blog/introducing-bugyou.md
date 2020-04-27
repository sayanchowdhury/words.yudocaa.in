+++
title   = "Introducing Bugyou"
slug    = "introducing-bugyou"
date    = "2016-01-07T14:09:43+05:30"
tags    = ["bugyou", "fedora", "planet"]
link    = "http://sayanchowdhury.dgplug.org/posts/introducing-bugyou"
description = ""
+++

We developed [Autocloud](https://kushaldas.in/posts/introducing-autocloud.html)
as a part of Fedora 23 release cycle as a part of Two week atomic image.

Autocloud publishes the messages to fedmsg when the image is queued, running,
success and failed.

## What is Bugyou?

Bugyou files issues for failed tests from Autocloud. Bugyou is part of Fedora
Project. It listens to Autocloud messages from fedmsg and files bug for images
which have failed the tests. Bugyou keeps updating the status of the images in
the bug and closes the issue once the tests are successful.

Currently Bugyou files issues in the repo [atomic-images](https://pagure.io/)
in [Pagure](https://pagure.io/)

![bugyou01](http://sayanchowdhury.fedorapeople.org/images/bugyou01.jpg)

If you want to learn about how it is deployed, please visit this
[page](http://bugyou.readthedocs.org/en/latest/)

## Future plans

The plan is to make Bugyou more generic and to have plugins (Autocloud, Koji)
and various issue tracking tools as services like Pagure, Github, Trac etc.
