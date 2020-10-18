# Utilities365

Refer to the [releases](https://github.com/ramarao9/Utilities365/releases) section for the compiled zip file.

Refer to the [Wiki](https://github.com/ramarao9/Utilities365/wiki) for documentation on the individual components. 

A tool that hopefully eases up some of repetitive tasks involved with querying data and metadata. Although it's a work in progress it was built to speed up the common tasks I experienced as a developer. 

The idea is to keep adding useful utilities that solve common problems that we encounter with Dynamics 365. So if you have any suggestions feel free to post an issue. While this tool acts as a basic utility it could also be used as a starter template to help you build your own application.

This tool is built using [Electron](https://electronjs.org/), [Node.js](https://nodejs.org/en/), [React](https://reactjs.org/) and [NPM](https://www.npmjs.com/). Some reasons that lead to this path as compared to building it as a WPF application.

- Using HTML, JS and CSS makes development much more easier and faster with all the latest open source frameworks available in the market and can also ease up building complex UIs.

- The code can be easily resused to build webresources, build an NPM package and for other front end development purposes.

- Support for front end development is huge and has a very big community that could easily help solve issues.

- Allows easy collaboration as most developers are used to Html, JS and CSS. While the tool uses typescript at places it's easy to pick up on Typescript if one knows JS.


# Using the Tool

After you extract the zip file from the releases, open the Utilities365.exe to launch the application. This would show the login screen if it's the first time as below

![](https://ramarao.blob.core.windows.net/utilities365/LoginScreen.jpg)



### Login Screen

To add a new organization specify the below information

**Name**:- The display name you would like to use

**Org URL**:- The url of the Dynamics 365 org you would like to connect.

**Azure AD Application Id**:- The Id of the application that was created under App registrations and granted permissions to Dynamics CRM. For details on how to register your app in Azure, refer to this [link](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

![](https://ramarao.blob.core.windows.net/utilities365/D365PermissionsForApp.jpg)

**Reply URL**:- Provide this value if you would like to use the authorization code access which would prompt you to securely log in to Dynamics 365 and request access.

You can use the suggested reply URL for the native desktop client under Authentication
![](https://ramarao.blob.core.windows.net/utilities365/ReplyUrlForApp.jpg)

**Client Secret**:- If you would like to use client credential grant or Server-2-Server authentication instead of the authorization code grant mentioned above, specify the client secret. You can generate one for your application under Certificates & secrets

![](https://ramarao.blob.core.windows.net/utilities365/ClientSecretForApp.jpg)


**Save Connection Locally**:- Only saves the Access Token information if using the authorization code or the client id and secret along with the organization url etc.


If using the authorization code grant you would be prompted to login to the org

![](https://ramarao.blob.core.windows.net/utilities365/D365LoginPrompt.jpg)

After successful login you would see the home page as below

![](https://ramarao.blob.core.windows.net/utilities365/HomePage.jpg)


### Switching Between Orgs

You can esily switch between different orgs when you have multiple connections by clickling on the Sign Out button in the navigation.

![](https://ramarao.blob.core.windows.net/utilities365/SignOut.jpg)


### CLI

There are times as a developer when you need to perform certain tasks in the web client but often times you have to perform multiple clicks or navigate certain steps to reach the desired destination or perform some operations. 

Some of these operations could include testing, grabbing the metadata or quickly validating the data changes. Having the ability to perform all these tasks from a single location could significantly improve productivity. While there are tools like Postman which could help these tasks it requires setup and configuration and the ability to build the request object. 


![](https://ramarao.blob.core.windows.net/utilities365/SampleQuery.jpg)

For a complete list of commands refer to the Wiki.

Feedback and contributions welcome!
