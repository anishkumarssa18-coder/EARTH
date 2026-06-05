const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// The World State
let worldState = {
    globalTime: 0,
    population: 8000000000,
    globalTemperature: 15.0,
    activeAnomalies: [],
    cities: [
        { id: 1, name: 'Neo-Tokyo', population: 35000000, wealth: 1000000, techLevel: 9.5, coordinates: { lat: 35.6762, lng: 139.6503 }, event: 'None' },
        { id: 2, name: 'New York Vertex', population: 20000000, wealth: 800000, techLevel: 8.9, coordinates: { lat: 40.7128, lng: -74.0060 }, event: 'None' },
        { id: 3, name: 'Floating City of Aethelgard', population: 500000, wealth: 5000000, techLevel: 10.0, coordinates: { lat: 0, lng: 0 }, event: 'Zero Gravity Storm' } // Anti-gravity anomaly
    ],
    newsFeed: []
};

// Simulation Loop (Runs offline / continuously)
const TICK_RATE = 1000; // 1 second real-time tick (can represent 1 day in sim time depending on scale)

setInterval(() => {
    // Increment global time
    worldState.globalTime += 1;
    
    // Simulate Civilizations
    worldState.cities.forEach(city => {
        // Natural growth/decline
        city.population += Math.floor((Math.random() - 0.4) * 1000); // Slight bias to growth
        city.wealth += Math.floor((Math.random() - 0.3) * 5000);
        
        // Random events
        if (Math.random() < 0.05) {
            const events = ['Economic Boom', 'Tech Breakthrough', 'Protest', 'Pandemic', 'Resource Shortage', 'Crime Wave'];
            city.event = events[Math.floor(Math.random() * events.length)];
            worldState.newsFeed.unshift(`[${worldState.globalTime}] ${city.name} is experiencing a ${city.event}.`);
        } else if (Math.random() < 0.1) {
            city.event = 'None';
        }
    });

    // Keep news feed bounded
    if (worldState.newsFeed.length > 50) {
        worldState.newsFeed.pop();
    }

    // Broadcast state to all connected observer clients
    io.emit('world_update', worldState);

}, TICK_RATE);

io.on('connection', (socket) => {
    console.log(`Observer Connected: ${socket.id}`);
    
    // Send immediate state
    socket.emit('world_update', worldState);

    // Player interactions
    socket.on('trigger_disaster', (cityId) => {
        const city = worldState.cities.find(c => c.id === cityId);
        if (city) {
            city.event = 'Meteor Strike';
            city.population -= 100000;
            worldState.newsFeed.unshift(`[${worldState.globalTime}] GOD ACTION: Meteor Strike hit ${city.name}!`);
            io.emit('world_update', worldState);
        }
    });

    socket.on('manipulate_gravity', (data) => {
        worldState.activeAnomalies.push({ type: 'Gravity Well', location: data.location });
        worldState.newsFeed.unshift(`[${worldState.globalTime}] GOD ACTION: Gravity manipulation at ${data.location.lat}, ${data.location.lng}`);
        io.emit('world_update', worldState);
    });

    socket.on('disconnect', () => {
        console.log(`Observer Disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`EARTH//ALIVE Core Engine running on port ${PORT}`);
    console.log(`Simulation running...`);
});
