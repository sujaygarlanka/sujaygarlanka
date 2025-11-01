+++
draft = false
title = 'Receipt Database'
summary = "A web application that can scrape your email for e-receipts and can catalog and analyze them in a dashboard."
weight = 0
[params]
  data = 'Software (2016)'
  dataColor = 'cyan'
+++

{{< figure src="https://raw.githubusercontent.com/sujaygarlanka/receipt-database/master/media/Midas%20Preview.gif" width="700px">}}
  
Full demo video [here](https://youtu.be/qonTct_nAA4).

Midas is a money management tool I built that catalogs and analyzes e-receipts from users' Gmail in a user-friendly dashboard. Its features are:
- Uses Google Sign In and OAuth 2.0 authorization for signing in and gaining permission to access a user's email
- Finds and extracts e-receipts to display them in a sortable table.
- Extracts data from the e-receipts and graphs the expenditures by days, weeks or months.
- Allows users to set budgets

**Technologies**: PHP, HTML/CSS/Javascript
