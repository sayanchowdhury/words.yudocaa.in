+++
title = "Redesigning fedimg (Part 2): Communication with AWS"
slug = "redesigning-fedimg-part-ii"
date = "2017-02-04T12:00:00+05:30"
tags = ["fedora", "fedimg", "python", "cloud", "atomic", "libcloud", "planet"]
link = "https://sayanchowdhury.dgplug.org/posts/redesigning-fedimg-part-ii"
description = ""
+++

In the previous [post](https://sayanchowdhury.dgplug.org/redesigning-fedimg-part-i/), I discussed what is fedimg and how it works currently.
In this post, I plan to explain the issue in the current uploading process of
the AMIs and how we plan to fix it.

# What's the problem?

[fedimg](https://github.com/fedora-infra/fedimg) boots an utility instance
using the RHEL AMI configured for that region.

The problem with this design is that while adding a new region we need to look
for the appropriate RHEL AMI in the newer region first. Afterward, we need to
test if fedimg works with the newer regions RHEL AMIs. Finally, if
everything turns out to be okay we can go ahead with adding the AMI to the
fedimg configuration.

This becomes a tedious task over time and delays adding a new region.

# How does redesign fixes this?

The new design completely removes the dependency of the utility instances.
fedimg would then utilize `euca-import-volume` to upload the raw cloud image to
create a volume via S3.

fedimg will keep retrying to check if the volume is read using
`euca-describe-conversion-tasks`. Once the volume is created, fedimg goes ahead
with creating the snapshot of the volume and then finally the AMI.

This change results in removing a lot of redundant code and a simpler fedimg
configuration file [[1]](https://github.com/fedora-infra/fedimg/blob/develop/fedimg.cfg.example#L22)[[2]](https://github.com/fedora-infra/fedimg/blob/ec2-upload/fedimg.cfg.example#L14).
I have been [working](https://github.com/fedora-infra/fedimg/compare/ec2-upload) on this for sometime now.

Adding a new region now becomes effortless as we just need to append the
region to the configuration file.

Fedimg also right now boots up test instances to test the AMIs and does a basic
`/bin/true` test. This test just ensures that the machine boots and nothing
more than that.

In the next post, I will be writing on how I will be going ahead to build a testing
infrastructure for the AMIs using
[Autocloud](https://apps.fedoraproject.org/autocloud/) and
[ResultsDB](http://docs.resultsdb20.apiary.io/#).
