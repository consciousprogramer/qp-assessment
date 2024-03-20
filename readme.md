# Grocery App qp-assessment

To test the API in Postman please import the collection from this **Postman Collection URL**:
>https://api.postman.com/collections/15593373-631bf83a-c75a-4531-849c-494bc345959f?access_key=PMAT-01HSD482T49QQJ7QK1QF7SBJD7

Use **Docker Compose** to start the API:
`docker-compose-up`

The API is exposed on PORT:`8080` so please make sure it's available or else node.js will exit.

There is **No need to create user's**, default users are automatically created and their details are automatically put into the `req` object. (check `src/v1/setup/server.setup.ts`). Also there is no authentication system, req data validation and a full blown error handing setup due to time constraints 🙌.