# Banking API Project

This api can create Wallets as Bank account and generate VISA cards to those accounts.

This simple project is fully tested and can be deployed with few commands.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest
  
  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

This project has been built using NestJS Framework and following CQRS practices in order to segragate Buisness Logic layer as well as enable the project to use Event Driven Design practices.

## Installation

```bash
$ npm install
```

## Running the app

```bash

# start required services
docker-compose up -d

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

the project will now be available in [http:localhost:3000](http:localhost:3000)

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Stack and technologies
This project was build using NestJS coupled with Postgres v12 and deployed on docker-compose for simplicity

We use an external service for the exchange rates [https://api.exchangeratesapi.io](https://api.exchangeratesapi.io)

And finally we use SQLite for integration testing.

## Documentation

This is the front-end documentation in order to implement these services on a front-end application

> Please note that amounts or balance are represented in cents, therefore `1000 EUR` equals `10€`

In order to identify each user, you need the following Headers to each request

```
X-User-Id : {userId}
X-Company-Id : {companyId}
```

Where `userId` and `companyId` are valid `uuid V4` identifiers

#### Create a Wallet `POST /wallet`

This route creates a Wallet using the company Identifier within the Headers. Thus you can create as many wallets in any of the currencies available.

**Expected Payload Example**
```json
{
    "balance": 10000,
    "currency": "GDP"
}
```

**Expected Output**
```json
{
    "id": "6050726e-fc5c-4778-90a1-9175af09b647"
}
```

#### Retrieve wallets `GET /wallet`

This route retrieves all the wallets associated to the company Id used in the Create Wallet Method.

**Expected output**

```json
[
    {
        "id": "6050726e-fc5c-4778-90a1-9175af09b647",
        "currentBalance": 10500,
        "currency": "GBP",
        "companyId": "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0e"
    },
    {
        "id": "f921308b-57cd-4ba5-aba6-6c9aa5bffad7",
        "currentBalance": 8500,
        "currency": "GBP",
        "companyId": "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0e"
    },
    {
        "id": "2c4e45ec-5e07-4152-b225-b0a29d6b6abf",
        "currentBalance": 11070,
        "currency": "EUR",
        "companyId": "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0e"
    }
]
```

#### Transfer funds `POST /wallet/{walletId}/transfer`

Where {walletId} equals the Wallet Id from where the funds are dispatched

**Expected Input**
```json
{
    "destinationWalletId": "2c4e45ec-5e07-4152-b225-b0a29d6b6abf",
    "amount": 50
}
```

destinationWalletId is the wallet where you would send the funds too.

> Please Note that you are only able to send funds to your own wallets, you cannot send funds to another company's wallet
> Also, if you send funds to a wallet with a different currency, we will charge a fee of 2,9%

**Expected Output**
`HTTP 201 Status`

#### Create a new card `POST /card`

When creating a card, this one if associated to a single Wallet and can only be used with the wallet's currency.

**Expected Input**

```json
{
    "walletId": "2c4e45ec-5e07-4152-b225-b0a29d6b6abf"
}
```

**Expected Output**
```json
{
    "id": "6050726e-fc5c-4778-90a1-9175af09b647"
}
```
The id of your newly created Card associated to the walletId shown above.

`HTTP STATUS 201`

#### Get cards `GET /card`

This method returns all the cards associated to your userId only, you will not be able to see all the cards of the company as you would for the wallets.

**Expected Output**

```json
[
    {
        "expirationDate": "2020-11-04",
        "status": false,
        "id": "a45bd449-da60-4cf5-8313-ed0b4b293ebf",
        "currency": "EUR",
        "currentBalance": 10000,
        "number": "4929854096154034",
        "ccv": "223",
        "userId": "3b8cbd4b-2365-4ab1-a907-8e28c75225fb",
        "walletId": "2c4e45ec-5e07-4152-b225-b0a29d6b6abf"
    }
]
```
`HTTP STATUS 200`

#### Block Card `POST /card/{cardId}/block`

You can block a card that is associated to your userId only. When blocking a card, all the remaining funds are automatically unloaded and placed back into the Wallet account.
You can undo this at a latter date by unblocking the card and loading funds back on the card manually.

**Expected Input**
`No payload required`

**Expected Output**
`HTTP STATUS 201`
#### Unblock Card `POST /card/{cardId}/unblock`

This method enables you to reactivate a blocked card.

**Expected Input**
`No payload required`

**Expected Output**
`HTTP STATUS 201`

#### Load Card with funds `POST /card/{cardId}/load`

This method enables you to move funds only from the wallet associated to your card.

**Expected Input**
```json
{
    "amount": 1200
}
```

**Expected Output**
`HTTP STATUS 201`
#### Unload Card funds `POST /card/{cardId}/unload`

This method lets you remove funds from your card back into your wallet

**Expected Input**
```json
{
    "amount": 1200
}
```

**Expected Output**
`HTTP STATUS 201`