+++
link = "http://sayanchowdhury.dgplug.org/blog/darkserver-improvement-two-three.html"
description = ""
tags = ["gsoc", "fedora", "darkserver"]
date = "2013-07-10T12:00:00+05:30"
title = "Darkserver Improvement: Week Two and Week Three"
slug = "darkserver-improvement-week-two-and-week-three"
+++

It’s been two weeks since i last posted my report on Darkserver. I could not
post week two update as I had been down with bad health(seasonal changes +
Loo). With the week coming to an end and /me recovering from fever, i badly
hurt my right wrist and that was end of it. I somehow manage to move myself to
a new city, Bengaluru. The week passed as a trauma for me :’(

After recovering, i was back to coding/resolving issue in darkserver.
Starting from the mid of week three, I started working on implementing the
support for secondary architecture. Darkserver now supports secondary
architecture(arm, ppc).

| **Defining the current structure of Darkserver:**
|
| **darkproducer**

.. code::

    $ darkproducer --start=BUILD_ID --config=CONFIG
    Options:
    -s BUILD_ID, --start=BUILD_ID Specifies the build id
    -c CONFIG, --config=CONFIG Specifies the Config file

The config files points to either of the configuration files for Koji, ARM,
PowerPC. The files being darkserverurl-koji.conf, darkserverurl-arm.conf,
darkserverurl-ppc.conf placed under configs/. The default being for koji.

A 'url' key was added to retask Queue to maintain the relation between the
build_id and the architecture.

The command line arguments in Darkserver are currently now parsed by
optparse python module. So, a pid is added to darkbuildqueue and
darkjobworker, so the command line arguments now is:

| **darkbuildqueue**

.. code::

    $ darkbuildqueue --start --pid=1
    Options:
    -s, --start start the buildqueue
    -p PID, --pid=PID specify the pid for build queue

| **darkjobworker**

.. code::

    $ darkjobworkder --start --pid=1 // To start job worker 1
    $ darkjobworkder --start --pid=2 // To start job worker 2
    $ darkjobworkder --stop --pid=1 // To stop job worker 1
    Options:
    -s, --start start the buildqueue
    -e, --stop stop the buildqueue
    -p PID, --pid=PID specify the pid
