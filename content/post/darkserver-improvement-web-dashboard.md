+++
link = "http://sayanchowdhury.dgplug.org/2013/darkserver-improvement-web-dashboard.html"
description = ""
tags = ["gsoc", "fedora", "darkserver"]
date = "2013-09-09T12:00:00+05:30"
title = "Darkserver Improvement: Web Dashboard"
slug = "darkserver-improvement-web-dashboard"
+++

There has been a lot of changes since I last posted my blog.

*Darkserver’s command line dashboard now supports the secondary architecture.
You can easily shutdown the darkproducer of specifying which architecture to
shutdown.*

.. code::

    dark> shutdown darkproducer arch

*The support for multiple buildqueues was removed.*

After a rigorous testing on my laptop, i pushed the code to the dev
instance that was assigned to me. But, a mysterious error happened, nor the pid or the daemon of darkproducer was getting created. Due to which the
complete project came to a halt. Later, it was figured out that i was
passing the config(—config) argument as a relative path of the conf file,
rather than the absolute path which created all this trouble. So, the
proper way to start the darkproducer is:

.. code::

    $ python darkproducer —start=157435 --config=/home/sayan/Development/darkserver/configs/darkserverurl-arm.conf

Darkserver also now has a web dashboard which shows the status of the
darkproducer, darkbuildqueue and the darkjobworkers.

.. image:: ../galleries/web_dashboard-800x600.png
    :width: 100%
    :align: center
