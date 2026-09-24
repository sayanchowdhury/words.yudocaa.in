---
author: Sayan Chowdhury
categories:
- Blog Posts
date: '2025-02-05'
description: >-
  KubeCon+CloudNativeCon India 2024 event report
images:
  - "/images/kubecon-india-2024/1.jpg"
  - "/images/kubecon-india-2024/2.jpg"
  - "/images/kubecon-india-2024/3.jpg"
  - "/images/kubecon-india-2024/4.jpg"
  - "/images/kubecon-india-2024/5.jpg"
  - "/images/kubecon-india-2024/6.jpg"
  - "/images/kubecon-india-2024/7.jpg"
  - "/images/kubecon-india-2024/8.jpg"
  - "/images/kubecon-india-2024/9.jpg"
  - "/images/kubecon-india-2024/10.jpg"
  - "/images/kubecon-india-2024/11.jpg"
  - "/images/kubecon-india-2024/12.jpg"
  - "/images/kubecon-india-2024/14.jpg"
  - "/images/kubecon-india-2024/15.jpg"
  - "/images/kubecon-india-2024/16.jpg"
slug: kubecon-cloudnativecon-india-2024
tags:
- conference
- report
- kubernetes
title: KubeCon + CloudNativeCon India 2024
---

{{< figure src="/images/kubeconindia2024-india-head.jpg" alt="Banner with KubeCon and Cloud Native Con India logos" position="center" >}}

Conference attendance had taken a hit since the onset of the COVID-19 pandemic.
Though I attended many virtual conferences and was glad to present at a few
like FOSDEM - a conference I had always longed to present at.

Sadly, the virtual conferences did not have the feel of in-person conferences.
With 2024 here and being fully vaccinated, I started attending a few in-person
conferences. The year started with FOSSASIA in Hanoi, Vietnam, followed by a
few more over the next few months.

December 2024 was going to be special as we were all waiting for the first
edition of KubeCon + CloudNativeCon in India. I had planned to attend the EU/NA
editions of the conference, but visa issues made those more difficult to
attend. As fate would have it, India was the one planned for me.

KubeCon + CloudNativeCon India 2024 took place in the capital city, Delhi,
India from 11th - 12th December 2024, along with co-events hosted at the same
venue, Yashobhoomi Convention Centre on 10th December 2024.

### Venue

Let's start with the venue. As a conference organizer for other conferences,
the thing that blew my mind was the venue, YASHOBHOOMI (India International
Convention and Expo Centre). The conference venue was huge to accommodate large
scale conferences, and I also got to know that the convention centre is still in
progress and there are more halls to come. If I heard correctly, there was another
parallel conference running in the venue around the same time.


Now, let's jump to the conference.

### Maintainer Summit

The first day of the conference, 10th December 2024, was the CNCF Maintainers
Summit. The event is exclusive for people behind CNCF projects, providing space
to showcase their projects and meet other maintainers face-to-face.

Due to the chilly and foggy morning, the event started a bit late to
accommodate more participants for the very first talk. The event had a total of
six talks, including the welcome note. Our project, Flatcar Container Linux,
also had a talk accepted: "A Maintainer's Odyssey: Time, Technology and
Transformation".

This talk took attendees through the journey of Flatcar Container Linux from a
maintainer's perspective. It shared Flatcar's inspiration - the journey from a
"friendly fork" of CoreOS Container Linux to becoming a robust, independent,
container-optimized Linux OS. The beginning of the journey shared the daunting
red CI dashboard, almost-zero platform support, an unstructured release
pipeline, a mammoth list of outdated packages, missing support for ARM
architecture, and more -- hardly a foundation for future initiatives. The talk
described how, over the years, countless human hours were dedicated to
transforming Flatcar, the initiatives we undertook, and the lessons we learned
as a team. A good conversation followed during the Q&A with questions about
release pipelines, architectures, and continued in the hallway track.

During the second half, I hosted an unconference titled "Special Purpose
Operating System WG (SPOS WG) / Immutable OSes". The aim was to discuss the WG
with other maintainers and enlighten the audience about it. During the session,
we had a general introduction to the SPOS WG and immutable OSes. It was great
to see maintainers and users from Flatcar, Fedora CoreOS, PhotonOS, and Bluefin
joining the unconference. Since most attendees were new to Immutable OSes, many
questions focused on how these OSes plug into the existing ecosystem and the
differences between available options. A productive discussion followed about
the update mechanism and how people leverage the minimal management required
for these OSes.

I later joined the Kubeflow unconference. Kubeflow is a Kubernetes-native
platform that orchestrates machine learning workflows through custom
controllers. It excels at managing ML systems with a focus on creating
independent microservices, running on any infrastructure, and scaling workloads
efficiently. Discussion covered how ML training jobs utilize batch processing
capabilities with features like Job Queuing and Fault Tolerance - Inference
workloads operate in a serverless manner, scaling pods dynamically based on
demand. Kubeflow abstracts away the complexity of different ML frameworks
(TensorFlow, PyTorch) and hardware configurations (GPUs, TPUs), providing
intuitive interfaces for both data scientists and infrastructure operators.

### Conference Days

During the conference days, I spent much of my time at the booth and doing
final prep for my talk and tutorial.

On the maintainers summit day, I went to check the room for the conference
days, but discovered that room didn't exist in the venue. So, on the conference
days, I started by informing the organizers about the schedule issue. Then, I
proceeded to the keynote auditorium, where Chris Aniszczyk, CTO, Linux
Foundation (CNCF), kicked off the conference by sharing updates about the Cloud
Native space and ongoing initiatives. This was followed by Flipkart's keynote
talk and a wonderful, insightful panel discussion. Nikhita's keynote on "The
Cloud Native So Far" is a must-watch, where she talked about CNCF's journey
until now.

After the keynote, I went to the speaker's room, prepared briefly, and then
proceeded to the community booth area to set up the Flatcar Container Linux
booth. The booth received many visitors. Being alone there, I asked Anirudha
Basak, a Flatcar contributor, to help for a while. People asked all
sorts of questions, from Flatcar's relevance in the CNCF space to how it works
as a container host and how they could adapt Flatcar in their infrastructure.

Around 5 PM, I wrapped up the booth and went to my talk room to present
"Effortless Clustering: Rethinking ClusterAPI with Systemd-Sysext". The talk
covered an introduction to systemd-sysext, Flatcar & Cluster API. It then
discussed how the current setup using Image Builder poses many infrastructure
challenges, and how we've been utilizing systemd to resolve these challenges
and simplify using ClusterAPI with multiple providers. The post-talk
conversation was engaging, as we discussed sysext, which was new to many
attendees, leading to productive hallway track discussions.

Day 2 began with me back in the keynote hall. First up were Aparna & Sumedh
talking about Shopify using GenAI + Kubernetes for workloads, followed by
Lachie sharing the Kubernetes story with Mandala and Indian contributors as the
focal point. As an enthusiast photographer, I particularly enjoyed the talk
presented through Lachie's own photographs.

Soon after, I proceeded to my tutorial room. Though I had planned to follow the
Flatcar tutorial we have, the AV setup broke down after the introductory start,
and the session turned into a Q&A. It was difficult to regain momentum. The
middle section was filled mostly with questions, many about Flatcar's security
perspective and its integration. After the tutorial wrapped up, lunch time was
mostly taken up by hallway track discussions with tutorial attendees. We had
the afternoon slot on the second day for the Flatcar booth, though attendance
decreased as people began leaving for the conference's end. The range of
interactions remained similar, with some attendees from talks and workshops
visiting the booth for longer discussions. I managed to squeeze in some time to
visit the Microsoft booth at the end of the conference.

Overall, I had an excellent experience, and kudos to the organizers for putting
on a splendid show.

### Takeaways

Being at a booth representing Flatcar for the first time was a unique
experience, with a mix of people - some hearing about Flatcar for the first
time and confusing it with container images, requiring explanation, and others
familiar with container hosts & Flatcar bringing their own use cases. Questions
ranged from update stability to implementing custom modifications required by
internal policies, SLSA, and more. While I've managed booths before, this was
notably different. Better preparation regarding booth displays, goodies, and
Flatcar resources would have been helpful.

The talk went well, but presenting a tutorial was a different experience. I had
expected hands-on participation, having recently conducted a successful similar
session at rootconf. However, since most KubeCon attendees didn't bring
computers, I plan to modify my approach for future KubeCon tutorials.

At the booth, I also received questions about WASM + Flatcar, as Flatcar was
categorized under WASM in the display.

{{< carousel items="1" height="500" unit="px" duration="7000" >}}

---

Credits in the photos goes to CNCF posted in the [Kubecon + CloudNativeCon India 2024](https://www.flickr.com/photos/143247548@N03/albums/72177720322649179/) Flickr album & to [@vipulgupta.travel](https://www.instagram.com/vipulgupta.travel/)
