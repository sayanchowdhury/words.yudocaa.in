+++
link = "http://sayanchowdhury.dgplug.org/fedimg-course-of-action.html"
description = ""
tags = ["planet", "fedora", "fedimg"]
date = "2016-01-23T11:48:00+05:30"
title = "Fedimg: Course of Action"
slug = "fedimg-course-of-action"
+++

[Fedimg](https://github.com/fedora-infra/fedimg) is a Python-powered service which is built to make Fedora-Cloud images
available on popular cloud providers, such as Amazon Web Services (AWS). The
plans are to support more cloud providers such as Rackspace, Google Compute
Engine.

Fedimg listens for the messages from [Fedmsg](http://www.fedmsg.com/en/latest/)
for the [Koji](http://koji.fedoraproject.org/koji/) image builds.

Plan of work

* Add scripts to remove old AMIs we have uploaded
  (https://github.com/fedora-infra/fedimg/issues/37)

  Storing the AMIs are costing us lot. So the Cloud WG has decided to delete
  the older AMIs. The deletion criteria would be
  - Delete the pre-release AMIs after the final release
  - Delete the nightly build AMIs after 5 days of build


* Reorganize the way we upload images to AWS
  (https://github.com/fedora-infra/fedimg/issues/42)

  Currently fedimg boots up an instance, and downloads the image to volume and
  then takes the snapshot to create the AMI.

  [gholms](http://blog.devzero.com/) suggested that instead we can use euca2ools and using the command
  `euca-import-volume` we can directly create a volume out of the image. Then
  take the snapshot and create the AMI.


* Add generic re-try logic to all of fedimg's operations
  (https://github.com/fedora-infra/fedimg/issues/34)

  Currently, the upload method for the EC2 Service is a big chunk of code.
  My plan is to break code like these into different chunks and add a retry
  decorator to it. The decorator will handle things like delay, number of times
  to run etc.


* Get autocloud to do the testing on AMIs
  (https://github.com/fedora-infra/fedimg/issues/43)

  Currently, Tunir has the feature to test the AMIs but it's in the
  development branch and before starting off with this issue we need to work on
  autocloud too in between to integrate the feature to test AMIs.


* Generate a work report at the end of a job
  (https://github.com/fedora-infra/fedimg/issues/26)

  This is an easy-fix to add to add standard logging and can be completed with
  the other tasks in progress.


* Add secondary cloud providers
  (https://github.com/fedora-infra/fedimg/issues/10)

  This issue is blocked on legal stuff. So, as I work on other issues I will be
  checking the status for this ticket and can swap some low-priority issue with
  this and write up the service which is clear to go.


## Interested?

If you are interested to help out you can ping on IRC in #fedora-apps on
Freenode.
