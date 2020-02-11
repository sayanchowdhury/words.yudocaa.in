+++
title = "Redesigning the fedimg AMI creation process - Part 1"
slug = "redesigning-fedimg-part-i"
date = "2017-01-30T20:00:00+05:30"
tags = ["fedora", "fedimg", "python", "cloud", "atomic", "libcloud", "planet"]
link = "https://sayanchowdhury.dgplug.org/posts/redesigning-fedimg-part-i"
description = ""
+++

# What is fedimg?
[Fedimg](https://github.com/fedora-infra/fedimg) is a [Python](https://www.python.org/)-powered service that uploads the [Fedora Cloud](https://alt.fedoraproject.org/cloud/) images on
various Cloud providers. such as Amazon Web Services (AWS) .

# How does it currently work?
Fedimg listens to fedmsg for nightly as well as the production compose builds
messages. On receiving a new message, the
[FedimgConsumer](https://github.com/fedora-infra/fedimg/blob/develop/fedimg/consumers.py#L35)
triggers the upload process. fedimg uses fedfind to extract the metadata for
the compose from where it get's the URL for the compressed raw image files.

The AWS
[EC2Service](https://github.com/fedora-infra/fedimg/blob/develop/fedimg/services/ec2.py#L58)
then starts the process of creating the AMI.

- Booting up the utility instance.  
The `EC2Service` parses the fedimg configuration file to get the list of
[configuration](https://github.com/fedora-infra/fedimg/blob/develop/fedimg.cfg.example)
regions mapped with the RHEL AMIs, AKIs, architecture etc. `EC2Service.upload` starts the uploading by booting a utility instance in the
first region(determined from the config file). The process continuously keeps trying to ssh into the machine to check if the machine has boot-ed up.

- Downloading image & taking snapshot  
Once the utility instance is ready to use the compressed RAW image is
downloaded in the secondary volume. A snapshot is taken out of the volume and
the AMI is created out of it.

- The AMIs are then copied to the other regions

- Testing the AMIs
Once the AMIs are created, a very basic `/bin/true` test is performed on a test
instance created using one of the created AMIs. Once the tests passes, the AMIs
are made public.

At any point doing the execution, if the code throws an exception and even if
the AMIs fails the `_clean_up` method is fired. The
[method](https://github.com/fedora-infra/fedimg/blob/develop/fedimg/services/ec2.py#L140)
cleans up the utility instance, test instance and the volumes which were
created.

The next blog [post](https://sayanchowdhury.dgplug.org/redesigning-fedimg-part-ii/) will discuss the issues related to the current
architecture and about the new architecture.
