+++
title   = "Four Weeks in Fedora"
slug    = "four-weeks-in-Fedora"
date    = "2015-11-24T08:24:43+05:30"
tags    = ["autocloud", "bugyou", "fedora", "planet"]
link    = "http://sayanchowdhury/posts/four-weeks-in-fedora"
description = ""
+++

26th of October 2015, I joined [**Red Hat**](http://www.redhat.com/) as a part of the [**Fedora Engineering
Team**](https://fedoraproject.org/wiki/Fedora_Engineering).

I have been contributing to the Fedora for couple of years now starting from
the contributing to [**askbot-devel**](https://github.com/ASKBOT/askbot-devel) while we were gearing up for the [**Ask
Fedora**](https://ask.fedoraproject.org/en/questions/) release. This year in July, I along with [**kushal**](kushaldas.in), [**rtnpro**](www.rtnpro.com), [**praveenkumar**](http://kumar-pravin.blogspot.in/)
started working on [**Autocloud**](github.com/kushaldas/autocloud), as a part of the [**Two-Week Atomic**](https://fedoraproject.org/wiki/Changes/Two_Week_Atomic) during the
Fedora 23 cycle. So, I last couple of years of I have met and worked with a lot
of people in the Fedora community. Joining Fedora was like working with
friends.

I joined as a remotee working from Pune. I will be primarily working
on different applications in the [**Fedora Infrastructure**](github.com/fedora-infra/)

## First Week

I was handed over a Lenovo Thinkpad T450s, it turned out to be a good working
machine with good configs. I started using [**mutt**](http://www.mutt.org/) as my email client, [**pass**](http://www.passwordstore.org/) for
managing passwords, [**taskwarrior**](taskwarrior.org) and [**bugwarrior**](https://github.com/ralphbean/bugwarrior/) to manage my tasks and bugs.

Chalked out a plan for [**Bugyou**](piratepad.ca/p/bugyou) and worked on a POC. [**Bugyou**](pagure.io/bugyou/) is an automatic bug
reporting tool that consumes the messages from fedmsg and file bugs to
different bug tracking tools for registered topics. I wrote down a fedmsg
consumer that would be consuming the failed and the successful messages and file
tickets from them [**pagure**](pagure.io).

## Second and Third Week.

During these two weeks, my primary focus was on deploying Bugyou. I fixed a
couple of bugs in [**libpagure**](https://pagure.io/libpagure/), which is a Python library for the Pagure APIs.
I started packaging python-libpagure and making it ready for deployment as it
was dependecies for Bugyou. python-libpagure being my first RPM package I spent
a lot of time reading through the guidelines, fixing the issues in accordance to the review
given in the [**review request**](https://bugzilla.redhat.com/show_bug.cgi?id=1281739).

I added some management commands for Autocloud to abort long running task and
also to re-queue tasks. I also started with learning golang and wrote a minimalist 
logging framework from [**brume**](https://pagure.io/brume).

We also had a [**Python3 Porting FAD**](https://fedoraproject.org/wiki/FAD_Python_3_Porting_2015) on November 14-15 where I ported the
python-retask to Python 3. [**Retask**](github.com/kushaldas/retask/) is a python module to create and
manage distributed task queue/job queue.

## Fourth Week

I worked with a [**feature**](https://pagure.io/pagure/pull-request/491) in pagure to show the list of commits before a
particular commit hex. I gave a demo of Bugyou the [**Fedora Release Engineering Tools Demo**](https://youtu.be/bkEXz601kM4).
At the end of the week, I had my New Hire Orientation programme where I learnt
more about the culture, people and met new people at Red Hat.

**It seems to be exciting road ahead!**.

Currently, I am working on a [**new architecture**](https://github.com/sayanchowdhury/bugyou/blob/develop/docs/diagrams/bugyou.txt) for Bugyou. If you are looking forward to help, come to #fedora-apps on freenode.
