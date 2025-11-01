+++
draft = false
title = 'Book Exchange'
summary = "A website for Duke students to more easily buy and sell books among each other. It served over 1300 students."
weight = -1
[params]
  data = 'Software (2016)'
  dataColor = 'cyan'
+++

{{< figure src="https://raw.githubusercontent.com/sujaygarlanka/swift-book-exchange/master/media/Swift%20Book%20Exchange%20Preview.gif" width="700px">}}

Full demo video [here](https://youtu.be/qWIU2gYCGr8).

A friend and I built a website for Duke students to more easily buy and sell books among each other. Previously, students were using a Facebook group to buy and sell books among students, which was cumbersome and inefficient. Around **1300** students signed up, **450** students had either bought or sold a book and it had over **550** books posted on the website at its peak. A few features we included are:

- Using Google Book API to fetch book information like ISBN, authors, and cover images by simply entering the title
- Preloaded Duke classes for easy course information entry
- A dashboard for tracking user transaction history
- Facebook integration allowing users to share books they were selling
- Duke login authentication to ensure only Duke students could access the platform
- Comprehensive email notifications for buying and selling activities

**Technologies**: PHP, HTML, CSS, JavaScript (with jQuery for DOM & AJAX)
