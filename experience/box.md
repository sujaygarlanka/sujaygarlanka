# Box (Aug 2019 - Present)

I am one of two people who develop and maintain the open source [Box SDKs](https://github.com/box/sdks) in Github to allow people to integrate with Box's API. Every minute over 1.3 million API calls are made through our SDKs. We support SDKs in [Java](https://github.com/box/box-java-sdk), [.NET](https://github.com/box/box-windows-sdk-v2), [Python](https://github.com/box/box-python-sdk), [Node.js](https://github.com/box/box-node-sdk), [CLI](https://github.com/box/boxcli), [iOS content](https://github.com/box/box-ios-sdk) and [iOS preview](https://github.com/box/box-ios-preview-sdk) SDKs. All the features I have implemented can be found in the Github repos above. Below are a few examples of my work at Box:

**Rewrite of networking layer for iOS SDK**
- Removes dependency on [Alamofire](https://github.com/Alamofire/Alamofire) by rewriting the networking layer with URLSession
- Reduces SDK size by 70%
- More space efficient by directly merging an upload stream with a multipart body stream instead of first writing it to disk
- After this rewrite, I add support for viewing the progress [(#694)](https://github.com/box/box-ios-sdk/pull/694) of and cancelling [(#713)](https://github.com/box/box-ios-sdk/pull/713) uploads and downloads

<script src="https://gist.github.com/sujaygarlanka/c1c8a4614bde622d99ae68e194a76703.js"></script>

**Support Creation and Downloading of Zip Files**
- Adds the ability to create a zip of any random collection of files and folders in a Box account
- Adds the ability to download it locally as well
- Allows customers who use Box on the backend to provide zip functionality for their users to download all their content easily
- Common use case is insurance companies who use Box to store their customer's claims, insurance info, etc.

<script src="https://gist.github.com/sujaygarlanka/80fa584e09ea3c4cdc12a01ffae88b64.js"></script>