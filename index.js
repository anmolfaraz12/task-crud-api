const express = require('express');
const app = express();
app.use(express.json());

app.get('/',(req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    });
});

app.get('/health' , (req, res) => {
    res.json({
        status: "OK"
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
