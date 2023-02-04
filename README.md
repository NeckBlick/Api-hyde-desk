# REST API - Hyde Desk

O Hyde Desk é uma empresa de suporte técnico empresarial que tem como propósito o atendimento rápido, ágil e eficiente. 

Decidimos criar um sistema para colocar em pratica a nossa ideia descrita acima, por esse motivo, criamos essa API REST para facilitar a entrega de dados ao sistema. 


## Install

     npm install 

## Run the app

     npm run dev 


## Requests GET

### Base url

http://localhost:4001/

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    [
        {
            message: "Seja bem vindo a API do Hyde Desk"
        }
    ]



### Request POST

`POST /thing/`

    

### Response

    HTTP/1.1 201 Created
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 201 Created
    Connection: close
    Content-Type: application/json
    Location: /thing/1
    Content-Length: 36

    

## Get a specific Thing

### Request PUT

` /thing/id`

    

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 36

    

## Get a non-existent Thing

### Request DELETE

``


### Response

    HTTP/1.1 404 Not Found
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 404 Not Found
    Connection: close
    Content-Type: application/json
    Content-Length: 35

    
