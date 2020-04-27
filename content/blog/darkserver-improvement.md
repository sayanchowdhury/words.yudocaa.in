+++
link = "http://sayanchowdhury.dgplug.org/2013/darkserver-improvement.html"
description = ""
tags = ["fedora", "gsoc"]
date = "2013-07-26T12:00:00+05:30"
title = "Darkserver Improvement"
slug = "darkserver-improvement"
+++

I am currently doing some manual testing of my code, and it proved to be vital. It helped me figure out a lot of bugs. One of seemed weird to me in the beginning: The get [here](https://github.com/sayanchowdhury/darkserver/blob/config/darkimporter/libimporter.py#L310) returned an error.

.. code::

    Method Not Allowed This is an XML-RPC server. Only POST requests are
    accepted.

The project required a heavy amount of download, so my mentor gave me a dev
instance to test out my code, all seemed to be fine, with the code properly
working on local machine. But on the dev instance a major bug surfaced, all the architecture with referring to the same key. So, currently i started
working on implementing different darkproducer-ids for different darkproducers.Also, I need to get started with a long-term bug, my mentor
pointed me in the shutdown functionality of darkserver.
