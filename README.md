# Prerequisites

## Environment Variables

Before you build/deploy the CDK package, you need to specify a target account id and a region.

```
export CDK_DEPLOY_ACCOUNT=<AWS ACCOUNT ID>
export CDK_DEPLOY_REGION=<REGOIN>
```

## Secret Manager

You need to store your App's slack token and user name in a Secrets Manager secret named 'SlackTokenForBMO'.

```
SLACK_TOKEN: <App's slack token> (something begins with xoxb- or xoxp-)
APP_UNAME: <App's user name> (something like U01234ABCDE)
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
