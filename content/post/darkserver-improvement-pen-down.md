+++
link = "http://sayanchowdhury.dgplug.org/2013/darkserver-improvement-pen-down.html"
description = ""
tags = ["gsoc", "fedora", "darkserver"]
date = "2013-09-25T12:00:00+05:30"
title = "Darkserver Improvement: Pen Down"
slug = "darkserver-improvement-pen-down"
+++

Lot of things to do!

Lot of things to do!

Lot of things to do!

This was continuously revovlving around my head for last 2 weeks. I had to
deploy the work i had done on staging instance and test it. But wait! I had
never written a setup.py before, never made a RPM package before.

While in college, I had a fascination toward RPM packaging as most of my
college seniors had created a RPM package sometime or other. During Mukti
2011, I had attended a RPM packaging workshop by Rahul Sundaram(mether), so i had the idea of how to package a RPM.

But well before that i had to write a setup script for darkserver. Though the basic setup.py did not take much time, but i got stuck when it came to
include staticfiles in setup.py. After a lot of googling and seraching, the
result was null. So i asked in #python IRC channel, when Ned Batchelder
helped me out. Finally, I got a link to package a Django app titled-
Packaging a Django resuable app

After completing writing setup.py, I started working on building RPM
packaging. Here are some links:

* [Packaging:Guidlines](https://fedoraproject.org/wiki/Packaging:Guidelines?rd=Packaging/Guidelines)
* [How to create an RPM package](http://fedoraproject.org/wiki/How_to_create_an_RPM_package)
* [Packaging:Python](http://fedoraproject.org/wiki/Packaging:Python)

After completing rpm packaging, it’s time for koji scratch build. And i did it
but while installing it in the staging instance, something happened. I had
used target as rawhide instead of dist-6E-epel while koji scratch build.
Nevermind, I repeated the steps and voilà, i successfully perform a fresh
install of the package and everything was working properly.:)

And, with that Google Summer of Code came to an End.

.. image:: ../galleries/the-end.jpg
    :width: 90%
    :align: center
