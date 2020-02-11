+++
authors = ["Sayan Chowdhury"]
date = 2018-11-28T18:30:00Z
excerpt = ""
hero = "/images/013287f6780b3fad4f885d5b6026a3f5.jpg"
timeToRead = 4
title = "Fedora AMIs for EC2 Instances (A1) Powered by Arm-Based AWS Graviton Processors"

+++
[AWS recently announced their new fleet of A1 EC2 instances which is powered by ARM at AWS re:Invent.](https://aws.amazon.com/blogs/aws/new-ec2-instances-a1-powered-by-arm-based-aws-graviton-processors/)

Gladly, the Fedora Kernel Team (Laura Abbott, Justin Forbes and Jeremy Cline) and Peter Robinson had already everything in place. The only missing piece was to add the support to fedimg to create arm64 based AMIs.

With the release of [fedimg==2.4.0](https://github.com/fedora-infra/fedimg/releases/tag/2.4.0) (thanks to Patrick), the new AMIs were happily getting uploaded to AWS and with a slight delay, Fedora had the support for the arm64 along with the x86_64 AMIs.

## Known issues?

One of the issues which I faced was the instance getting ready takes some time which is almost 5 minutes. But [work is on the way to make the experience better](https://fedoramagazine.org/fedora-29-arm-aws/).

## Availability?

A1 instances are currently supported only in selected regions: US East (N. Virginia), US East (Ohio), US West (Oregon), Europe (Ireland).

Also not all the availability zones are supported, so while launching instances you might see this error:

    An error occurred (Unsupported) when calling the RunInstances operation: Your requested instance type (a1.large) is not supported in your requested Availability Zone (us-west-2b). Please retry your request by not specifying an Availability Zone or choosing us-west-2c, us-west-2a.

which I found linked to the subnet's availability zone. So, you might need to change the subnet's availability zone to launch the instance.

For any more issues, drop into #fedora-arm or #fedora-cloud IRC channel on Freenode.

Read the official announcement [here](https://fedoramagazine.org/fedora-29-arm-aws/).