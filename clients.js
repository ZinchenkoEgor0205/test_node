const express = require('express');
const router = express.Router();

// const clients = [
//     { id: 1, name: 'Client A', email: 'clientA@example.com' },
//     { id: 2, name: 'Client B', email: 'clientB@example.com' },
//     { id: 3, name: 'Client C', email: 'clientC@example.com' },
// ];

router.get('/', (req, res) => {
    res.json(clients);
});

router.get('/:id', (req, res) => {
    const clientId = parseInt(req.params.id, 10);
    const client = clients.find(c => c.id === clientId);

    if (client) {
        res.json(client);
    } else {
        res.status(404).json({ message: 'Client not found' });
    }
});

module.exports = router;