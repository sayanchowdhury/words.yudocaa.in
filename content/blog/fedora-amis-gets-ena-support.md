+++
authors = ["Sayan Chowdhury"]
date = 2018-05-24T18:30:00Z
excerpt = ""
hero = "/images/c0ee2b4be7bb68c869c5ee8fbbe1fd6c.jpg"
timeToRead = 2
title = "Fedora AMIs gets ENA support"

+++
It’s been a while that Amazon introduced Elastic Network Adapter (ENA) Support to their cloud. Amazon EC2 provides enhanced networking capabilities to C5, C5 with instance storage, F1, G3, H1, I3, m4.16xlarge, M5, P2, P3, R4, and X1 instances through the Elastic Network Adapter (ENA).

With the Fedora 28 release, the Fedora AMIs come with the ENA support.

To check whether an AMI has the Enhanced Networking with ENA-Enabled, you can query the AWS EC2 API, using the AWS Command Line Interface. You need to check if the enaSupport attribute set. If the attribute is set, the response is true.

    ➜  ~ aws ec2 describe-images --region us-east-1 --image-id ami-cceb7ab3 --query 'Images[].EnaSupport'
    ----------------
    |DescribeImages|
    +--------------+
    |  True        |
    +--------------+

  
Also with Fedora 28 release, Fedora deprecates the release of paravirtual (PV) images.