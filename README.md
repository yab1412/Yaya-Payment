# Yaya-Payment

For the app, There are two separate folders, Front and Back, to handle the frontend and the backend respectively. On the backend I used nodeJs and express And for the frontend I used ReactJs.To run open the folders separately and run *npm run dev*

The backend has two main files, The server.js and .env that handle the back end structure and the security. To get in to the detail of each file, the server first initialize express to start the app, cors to handle cors headers to allow communication between the frontend, dotenv to handle the security of the api key and the secret key.Crypto handles the encrypting.

The first part of the code is basic assigning and configuring the start of the app. The second part of the code handle generating of the header for authenticate requests to Yaya Wallet API. The third part handles the transaction route.


Going to the frontend, I used reactJs(Typscript) and Sass for the styling. There are three main files. The first one is api.ts, which handles the connection with the backend and fetching the data. The second is page.tsx, which is the main page component to display the data. It calls and get the data from api.ts. Defines a type to represent the structure of a transaction object.