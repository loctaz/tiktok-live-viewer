const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/api/live-data', async (req, res) => {
    const { streamId } = req.query;
    try {
        const response = await axios.get(`https://webcast.immomo.com/webcast/room/reverse_info/?room_id=${streamId}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Proxy server running on port 3000');
});
