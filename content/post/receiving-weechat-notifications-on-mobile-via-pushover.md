+++
title = "Receiving Weechat Notifications on mobile via Pushover"
slug = "receiving-weechat-notifications-on-mobile-via-pushover"
date = "2016-04-11T11:44:00+05:30"
tags = ["weechat", "fedora", "irc", "pushover", "notification", "planet"]
link = "https://sayanchowdhury.dgplug.org/receiving-weechat-notifications-on-mobile-via-pushover"
description = ""
+++

I recently switched to use Weechat as my primary IRC client from X-Chat. I did
a setup of [Weechat](https://weechat.org) on my [Digital Ocean](https://m.do.co/c/6b0be140d8a3) box.

Weechat setup turned out to be super simple and out of the box. I am running
Weechat within a tmux session. But the problem I was facing was due to poor
internet connection (thanks to Airtel for this and this was my primary reason
for switching to weechat from Xchat) I got disconnected from the DO box quite
often.

So, I looked over for a solution to get IRC notfications to my mobile device
and Weechat seems to already have a script for that called
[pushover.pl](https://weechat.org/scripts/source/pushover.pl.html/).

So, The script pushes the notifications from weechat to your device via
Pushover.

## Installing the script

{{< highlight bash "linenos=inline, style=vim" >}}
/script install pushover.pl
{{< /highlight >}}


Create an account in [Pushover](https://pushover.net/), verify your email and create an application.
Once the application is created you find your application token, and your user
key.

## Configuring

{{< highlight bash "linenos=inline, style=vim" >}}
/set plugins.var.perl.pushover.token <your application token>
/set plugins.var.perl.pushover.user <your user key>
{{< /highlight >}}

Now, your weechat is set to send messages through Pushover, install the
[application on your mobile device](https://pushover.net/clients) and you will start receiving the irc messages
whenever you are mentioned or a private message.

The script also offers other customizations like

{{< highlight perl "linenos=inline,style=emacs" >}}
'enabled' => ['on', "Turn script on or off"]
'service' => ['pushover', 'Notification service to use.']
'token' => ['', 'pushover API token/key']
'user' => ['', "pushover user key"]
'nma_apikey' => ['', "nma API key"]
'pb_apikey' => ['', "Pushbullet API key"]
'pb_device_iden' => ['', "Device Iden of pushbullet device"]
'sound' => ['', "Sound (empty for default)"]
'priority' => ['', "priority (empty for default)"]
'show_highlights' => ['on', 'Notify on highlights']
'show_priv_msg' => ['on', 'Notify on private messages']
'redact_priv_msg' => ['off', 'Hide the private message text']
'only_if_away' => ['off', 'Notify only if away status is active']
'only_if_inactive' => ['off', 'Notify only if buffer is not active']
'blacklist' => ['', 'Comma separated blacklist for notifications']
'verbose' => ['1', 'Verbosity level']
'rate_limit' => ['0', 'Rate limit in seconds']
'short_name' => ['off', 'Use short buffer name in notification']
{{< /highlight >}}
