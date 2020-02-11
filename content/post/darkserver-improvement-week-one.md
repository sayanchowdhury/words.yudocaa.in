+++
link = "http://sayanchowdhury.dgplug.org/2013/darkserver-improvement-week-one.html"
description = ""
tags = ["fedora", "gsoc", "darkserver"]
date = "2013-06-24T12:00:00+05:30"
title = "Darkserver Improvement: Week One"
slug = "darkserver-improvement-week-one"
+++

The ‘Google Summer of Code’ code period began on June 17 and it’s already one
week into it. Prior to the beginning of the coding period, I went into the
depths of the darkserver codebase. In the current version of Darkserver, the
link present in the libimporter are hardlinks and it is pretty well visible
on Github

So, I removed the urls and the values from the libimporter and made it
configurable via config files. The config files are currently present in the
configs/ directory. This will eventually help to allow us to add different job
queues for different secondary architectures.

According to the Darkserver wiki, the steps for starting the darkproducer is:

.. code::

    $ darkproducer start KOJI_BUILD_ID

Now, after removing the hardlinks and making it accesible through config
files, the steps to start the darkproducer is:

.. code::

    $ darkproducer start KOJI_BUILD_ID —config=/path/to/config/file

The configuration file for koji should be in form of:

.. code::

    [darkserver]
    url = ‘http://koji.fedoraproject.org/kojihub/’

In case of violation, the config option defaults to
/etc/darkserver/darkserverurl-koji.conf

Next, I would be aiming for implementing the support for the secondary
architectures, arm, ppc and add support to maintain different job queues for
the different secondary architectures.
