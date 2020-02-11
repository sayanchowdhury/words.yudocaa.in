+++
title = "Autocloud: What's new?"
slug = "autocloud-whats-new"
date = "2016-08-24T17:28:00+05:30"
tags = ["autocloud", "fedora", "planet", "infra"]
link = "https://sayanchowdhury.dgplug.org/posts/autocloud-whats-new"
timeToRead = 3
description = ""
+++
[Autocloud](https://apps.fedoraproject.org/autocloud/) was released during the Fedora 23 cycle as a part of the [Two Week
Atomic Process](https://fedoraproject.org/wiki/Changes/Two_Week_Atomic).

Previously, it used to listen to fedmsg for successful Koji builds. Whenever,
there is a new message the AutocloudConsumer queues these message for
processing. The Autocloud job service then listens to the queue, downloads the
images and runs the tests using Tunir. A more detailed post about it's release
can be read [here](https://kushaldas.in/posts/introducing-autocloud.html).

During the Fedora 24 cycle things changed. There was a change on how the Fedora
composes are built. Thanks to adamw for writing a detailed [blogpost](https://www.happyassassin.net/2016/02/15/pungi-4-the-new-generation-of-the-fedora-compose-tools-and-what-it-means-for-qa/) on what, why and how things
changed.

With this change now autocloud listens to the compose builds over the fedmsg.
The topic being "[org.fedoraproject.prod.pungi.compose.status.change](apps.fedoraproject.org/datagrepper/raw?topic=org.fedoraproject.prod.pungi.compose.status.change)". It checks
for the messages with the status FINISHED and FINISHED_INCOMPLETE.

After the filtration, it gets the Cloud Images built during that particular
compose using a tool called fedfind. The job here is parse the metadata of
the compose and getting the Cloud Images. These images are then queued into both libvirt and vbox boxes. The Autocloud job service then downloads the images and run the tests using
Tunir.

### Changes in the Autocloud fedmsg messages.

Earlier the messages with the following topics were sent

- [autolcoud.image.queued](https://fedora-fedmsg.readthedocs.io/en/latest/topics.html#autocloud-image-queued) - When the images are queued for testing
- [autocloud.image.running](https://fedora-fedmsg.readthedocs.io/en/latest/topics.html#autocloud-image-running) - When the tests for the images are running
- [autocloud.image.success](https://fedora-fedmsg.readthedocs.io/en/latest/topics.html#autocloud-image-success) - When the tests for the images passes.
- [autocloud.image.failed](https://fedora-fedmsg.readthedocs.io/en/latest/topics.html#autocloud-image-failed) - When the tests for the images failed

Now along with the fedmsg message for the status of the image test. Autocloud also
sends messages for the status of a particular compose.

- [autocloud.compose.queued](https://fedora-fedmsg.readthedocs.io/en/latest/topics.html#autocloud-compose-queued) - When the composes is in queued state
- [autocloud.compose.running](https://fedora-fedmsg.readthedocs.io/en/latest/topics.html#autocloud-compose-running) - When the images for the composes are in testing
  phase
- [autocloud.compose.complete](https://fedora-fedmsg.readthedocs.io/en/latest/topics.html#autocloud-compose-complete) - When running the test for the images for a
  compose finishes and contains the aggregate result for the tests

The `compose_id` field was added to the `autocloud.image.*` messages

### Changes in the UI

- A [page](https://apps.fedoraproject.org/autocloud/compose) was added to list all the composes. It gives an overview of the
  composes like if it's still running, number of tests passed, etc
- The [jobs page](https://apps.fedoraproject.org/autocloud/jobs) lists all the tests data as earlier. We added filtering to the
  page so filter the jobs based on various params
- You need to agree that the [jobs output page](https://apps.fedoraproject.org/autocloud/jobs/458/output) looks better than before. Now, rather the showing a big dump of text the output now is properly formatted. You can now reference each line separately.

Right now, we are planning to work on testing the images uploaded via fedimg in Autocloud. If the project looks interesting and you are planning to contribute? Ping us on #fedora-apps on Freenode.
