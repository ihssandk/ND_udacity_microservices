import express from 'express';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
import { Response, Request, Application } from 'express';
import { send } from 'process';
const fetch = require("node-fetch").default;
const cors = require('cors');



// Init the Express application
const app: Application = express();
const port = process.env.PORT || 8082;
app.use(cors());
app.get('/filteredimage', async (req: Request, res: Response) => {
  try {
    // Validate the image_url query
    const imageUrl = req.query.image_url;
    if (!imageUrl) {
      res.status(400).send({ message: "image_url query parameter is required" });
      return;
    }
    const imageUrlString = imageUrl as string;
     // Check if the image URL uses an HTTP or HTTPS protocol
     if (!imageUrlString.startsWith('http://') && !imageUrlString.startsWith('https://')) {
      res.status(404).send({ message: "Only HTTP(S) protocols are supported" });
      return;
    }

    // Bypass the CORS restriction to fetch the image data from the URL
    const stream = await fetch(imageUrl, {
      headers: {
        "Content-Type": "image/jpeg"
      }
    });
    const imageData = await stream.buffer();

    // Call filterImageFromURL to filter the image
    const filteredPath = await filterImageFromURL(imageData);

    // Send the resulting file in the response
    res.sendFile(filteredPath, () => {
      // Deletes any files on the server on finish of the response
      deleteLocalFiles([filteredPath]);
    
    });
  } catch (error) {
    console.error(error);
    res.status(422).send({ message: "Error processing image" });
  }
});

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
