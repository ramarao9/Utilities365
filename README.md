# Utilities365

Refer to the [releases](https://github.com/ramarao9/Utilities/releases) section for the compiled zip file.

A tool that eases up some of repetitive tasks involved with querying data and metadata. Although it's a work in progress it was built to speed up the common tasks I experienced as a developer and hopefully it helps others. 

The idea is to add more utilities that solve common problems that we encounter with Dynamics 365. So if you have any suggestions feel free to post an issue. While this tool acts as a utility it could also be used as a starter template to help you build your own application.

This tool is built using ElectronJs, ReactJS and NPM. There are a couple of reasons doing this compared to building it as a WPF application.

- Using HTML, JS and CSS makes development much more easier and faster with all the latest open source frameworks available in the market that can help building complex UIs.

- The code can be easily resused to build webresources, build an NPM package and any other front end development.

- Support for front end development is huge and has a very big community that could easily solve issues.


# Using the Tool

After you extract the zip file from the releases, open the Utilities365.exe to launch the application. This would show the login screen if it's the first time as below

![](https://ramarao.blob.core.windows.net/utilities365/LoginScreen.jpg)



### Login Screen

To add a new organization specify the below information

Name:- The display name you would like to use

Org URL:- The url of the Dynamics 365 org you would like to connect.

Azure AD Application Id:- The Id of the application that was create in App registrations and granted permissions to Dynamics CRM.

Reply URL:- Provide this value if you would like to use the authorization code access which would prompt you to securely log in to Dynamics 365 and request access.


Client Secret:- If you would like to use client credential grant or Server-2-Server authentication instead of the authorization code grant mentioned above, specify the client secret.

Save Connection Locally:- Only saves the Access Token information if using the authorization code or the client id and secret along with the organization url etc.

