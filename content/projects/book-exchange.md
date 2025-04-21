+++
draft = false
title = 'Book Exchange'
summary = "A website for Duke students to more easily buy and sell books among each other. It served over 1300 students."
weight = -3
[params]
  data = 'Software (2016)'
  dataColor = 'cyan'
+++

{{< figure src="https://raw.githubusercontent.com/sujaygarlanka/swift-book-exchange/master/media/Swift%20Book%20Exchange%20Preview.gif" width="700px">}}

Full demo video [here](https://youtu.be/qWIU2gYCGr8).

A friend and I built a website for Duke students to more easily buy and sell books among each other. Previously, students were using a Facebook group to buy and sell books among students, which was cumbersome and inefficient. Around **1300** students signed up, **450** students had either bought or sold a book and it had over **550** books posted on the website at its peak. A few features we included are:

- Using Google Book API to get book information like ISBN, authors, cover picture, etc by simply typing in the title
- Preloaded Duke classes so people can easily fill in the course information for a book
- A dashboard to track a user's transaction history
- Facebook integration to allow users to share on Facebook the books that they are currently selling on the exchange
- Duke login so only Duke students can login, preventing anyone from buying and selling books on the site
- Detailed email notifications when a user buys or sells

**Technologies**: PHP, HTML/CSS/Javascript
