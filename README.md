# Prerequisites

## GitHub personal access token

You need **repo** and **admin:repo_hook** permissions.

-   [Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

## Chatbot for Slack notification

We use Slack notification with [AWS Chatbot](https://aws.amazon.com/chatbot/) for monitoring Pipeline events.
You need to create a Chatbot slack client in advance to enable slack notification.

-   [Configure an AWS Chatbot client for a slack channel](https://docs.aws.amazon.com/dtconsole/latest/userguide/notifications-chatbot.html#notifications-chatbot-configure-client)

## Secrets Manager

You need to store your App's slack token and user name in a Secrets Manager secret named 'SlackTokenForBMO'.

```
SLACK_TOKEN: <App's slack token> (something begins with xoxb- or xoxp-)
APP_UNAME: <App's user name> (something like U01234ABCDE)
GITHUB_TOKEN: <GitHub access token>
SLACK_WS_ID: <Slack WorkSpace ID for notification>
SLACK_CHANNEL_ID: <Slack Channel ID for notification>
```

# Features

## vote

Increment/Decrement somebody's score with a comment.

### How to use

```
(syntax)
<name>++|-- <comment>

(example)
bmo++ thanks for your help!
finn++ jake++ nice!
iceking-- 🤷‍♂️
```

## add

Register some name and his/her/its description. (In short, adding item to Dictionary)

### How to use

```
(syntax)
!add <name> <comment>

(example)
!add bmo Finn and Jake's living video game console system
```

## word

Get description by name. (In short, getting item from Dictionary)

### How to use

```
(syntax)
!word <name>

(example)
!word bmo
```

## words

Retrieve all registered words.

### How to use

```
(syntax)
!words

(example)
!words
```

## search

Search word from word list.

### How to use

```
(syntax)
!search <word>

(example)
!search bmo
```

# How to develop

Each commands were implemented as a module extends `Behavior` interface in `lambda/modules/behaviors/`.
`Behavior` has following items.

* `type`: unique key of the command
* `triggerPattern`: regex as triggers the command when it matches a message in slack
* `reaction`: function executed when the command triggered

You can create new commands by adding modules to `lambda/modules/behaviors/` and exporting them from `lambda/modules/behaviors/index.ts`.
